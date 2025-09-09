import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

interface CreateRequestBody {
  action: "create";
  pet_id: string;
  to_email: string;
  organization_id?: string | null;
}

interface AcceptRequestBody {
  action: "accept";
  token: string;
}

interface StatusRequestBody {
  action: "status";
  token: string;
}

type RequestBody = CreateRequestBody | AcceptRequestBody | StatusRequestBody;

function isValidEmail(email: string) {
  return /.+@.+\..+/.test(email);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const json = (await req.json()) as RequestBody;

    if (json.action === "status") {
      const { token } = json;
      const { data, error } = await admin
        .from("transfer_requests")
        .select("status, to_email, pet_id, expires_at")
        .eq("token", token)
        .maybeSingle();
      if (error) throw error;
      if (!data)
        return new Response(
          JSON.stringify({ error: "Invalid token" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      return new Response(JSON.stringify({ ok: true, ...data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: userRes } = await authClient.auth.getUser();
    const user = userRes?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (json.action === "create") {
      const { pet_id, to_email, organization_id } = json;

      if (!pet_id || !to_email) {
        return new Response(JSON.stringify({ error: "Missing fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!isValidEmail(to_email)) {
        return new Response(JSON.stringify({ error: "Invalid email" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check: caller is pet owner OR org admin of provided org
      const { data: pet, error: petErr } = await admin
        .from("pets")
        .select("id, user_id, name")
        .eq("id", pet_id)
        .single();
      if (petErr) throw petErr;

      const isOwner = pet?.user_id === user.id;
      let isAdmin = false;
      if (organization_id) {
        const { data: isAdminData, error: adminErr } = await admin.rpc("is_org_admin", {
          _user_id: user.id,
          _org_id: organization_id,
        });
        if (adminErr) throw adminErr;
        isAdmin = Boolean(isAdminData);
      }

      if (!isOwner && !isAdmin) {
        return new Response(JSON.stringify({ error: "Not allowed" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Generate token
      const token = crypto.randomUUID().replace(/-/g, "");

      const { data: inserted, error: insertErr } = await admin
        .from("transfer_requests")
        .insert({
          pet_id,
          organization_id: organization_id || null,
          from_user_id: user.id,
          to_email: to_email.toLowerCase(),
          token,
        })
        .select("token")
        .single();
      if (insertErr) throw insertErr;

      return new Response(JSON.stringify({ ok: true, token: inserted.token }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (json.action === "accept") {
      const { token } = json;
      if (!token) {
        return new Response(JSON.stringify({ error: "Missing token" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: reqRow, error: reqErr } = await admin
        .from("transfer_requests")
        .select("*, pets:user_id")
        .eq("token", token)
        .maybeSingle();
      if (reqErr) throw reqErr;
      if (!reqRow) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (reqRow.status !== "pending") {
        return new Response(JSON.stringify({ error: "Transfer already processed" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Expiry check
      if (reqRow.expires_at && new Date(reqRow.expires_at) < new Date()) {
        return new Response(JSON.stringify({ error: "Transfer link expired" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Ensure accepting user email matches intended recipient
      const adopterEmail = user.email?.toLowerCase();
      if (!adopterEmail || adopterEmail !== reqRow.to_email?.toLowerCase()) {
        return new Response(JSON.stringify({ error: "Email mismatch for this transfer" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if adopter has an active subscription
      const { data: subscriberData, error: subError } = await admin
        .from("subscribers")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (subError) throw subError;
      if (!subscriberData || (subscriberData.status !== "active" && subscriberData.status !== "grace")) {
        return new Response(JSON.stringify({ error: "Adopter must have an active PetPort subscription to accept pet transfers" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Perform transfer transactionally
      // 1) Update pet owner
      const { error: petUpdateErr } = await admin
        .from("pets")
        .update({ user_id: user.id, updated_at: new Date().toISOString() })
        .eq("id", reqRow.pet_id);
      if (petUpdateErr) throw petUpdateErr;

      // 2) Mark request accepted
      const { error: reqUpdateErr } = await admin
        .from("transfer_requests")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
          to_user_id: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reqRow.id);
      if (reqUpdateErr) throw reqUpdateErr;

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("transfer-pet error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

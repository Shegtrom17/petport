import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const APP_ORIGIN = Deno.env.get("APP_ORIGIN") ?? "https://petport.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

interface CreateRequestBody {
  action: "create";
  pet_id: string;
  to_email: string;
  message?: string;
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

interface SubscriptionStatus {
  status: 'active' | 'grace' | 'suspended' | 'none';
  pet_limit: number;
  current_pets: number;
  can_add_pet: boolean;
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
      const { data: transfer, error } = await admin
        .from("transfer_requests")
        .select(`
          *,
          pets!inner(name, user_id),
          profiles!transfer_requests_from_user_id_fkey(full_name)
        `)
        .eq("token", token)
        .single();

      if (error || !transfer) {
        return new Response(JSON.stringify({ error: "Invalid or expired transfer" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Check if transfer has expired
      if (new Date() > new Date(transfer.expires_at)) {
        return new Response(JSON.stringify({ error: "Transfer has expired" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Check recipient subscription status
      let recipientStatus: SubscriptionStatus = {
        status: 'none',
        pet_limit: 0,
        current_pets: 0,
        can_add_pet: false
      };

      // Check if recipient email exists in system and get their subscription status
      const { data: existingUsers } = await admin.auth.admin.listUsers();
      const existingUser = existingUsers.users?.find(u => u.email?.toLowerCase() === transfer.to_email.toLowerCase());
      
      if (existingUser) {
        // Get subscription status
        const { data: subscription } = await admin
          .from("subscribers")
          .select("status, pet_limit, additional_pets")
          .eq("user_id", existingUser.id)
          .single();

        // Get current pet count
        const { count: petCount } = await admin
          .from("pets")
          .select("*", { count: "exact", head: true })
          .eq("user_id", existingUser.id);

        if (subscription) {
          const totalLimit = (subscription.pet_limit || 1) + (subscription.additional_pets || 0);
          const currentPets = petCount || 0;
          
          recipientStatus = {
            status: subscription.status === 'active' || subscription.status === 'grace' ? 'active' : 'suspended',
            pet_limit: totalLimit,
            current_pets: currentPets,
            can_add_pet: currentPets < totalLimit
          };
        }
      }

      // Determine what the recipient needs to do
      const needsSubscription = !existingUser || recipientStatus.status !== 'active';
      const needsUpgrade = existingUser && recipientStatus.status === 'active' && !recipientStatus.can_add_pet;

      const response = {
        ...transfer,
        pet_name: transfer.pets?.name,
        sender_name: transfer.profiles?.full_name,
        recipient_subscription_status: needsSubscription ? 'none' : (needsUpgrade ? 'at_limit' : 'active'),
        recipient_needs_subscription: needsSubscription,
        recipient_needs_upgrade: needsUpgrade
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
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

      // Auto-send transfer invitation email based on recipient status
      try {
        // Check if recipient exists and their subscription status
        const { data: existingUsers } = await admin.auth.admin.listUsers();
        const existingUser = existingUsers.users?.find(u => u.email?.toLowerCase() === to_email.toLowerCase());
        
        // Get sender and pet details for email
        const { data: senderProfile } = await admin
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();

        let emailType = "transfer_invite_new";
        let recipientStatus = "new";

        if (existingUser) {
          // Get subscription status
          const { data: subscription } = await admin
            .from("subscribers")
            .select("status, pet_limit, additional_pets")
            .eq("user_id", existingUser.id)
            .maybeSingle();

          // Get current pet count
          const { count: petCount } = await admin
            .from("pets")
            .select("*", { count: "exact", head: true })
            .eq("user_id", existingUser.id);

          if (subscription && (subscription.status === 'active' || subscription.status === 'grace')) {
            const totalLimit = (subscription.pet_limit || 1) + (subscription.additional_pets || 0);
            const currentPets = petCount || 0;
            
            if (currentPets >= totalLimit) {
              emailType = "transfer_limit_reached";
              recipientStatus = "at_limit";
            } else {
              emailType = "transfer_invite_existing";
              recipientStatus = "existing";
            }
          } else {
            emailType = "transfer_invite_new";
            recipientStatus = "needs_subscription";
          }
        }

        // Send the appropriate email
        await admin.functions.invoke("send-email", {
          body: {
            type: emailType,
            recipientEmail: to_email,
            petName: pet?.name || "Pet",
            petId: pet_id,
            senderName: senderProfile?.full_name || "A PetPort user",
            transferToken: inserted.token,
            transferUrl: `${APP_ORIGIN}/transfer/accept/${inserted.token}`,
            recipientStatus,
            customMessage: json.message
          }
        });

        console.log(`Transfer invite email sent: ${emailType} to ${to_email}`);
      } catch (emailError) {
        console.error("Error sending transfer invite email:", emailError);
        // Don't fail the transfer creation for email issues
      }

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
        .select(`
          *,
          pets!inner(name, user_id),
          profiles!transfer_requests_from_user_id_fkey(full_name)
        `)
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

      // Check if adopter has an active subscription and pet capacity
      const { data: subscriberData, error: subError } = await admin
        .from("subscribers")
        .select("status, pet_limit, additional_pets")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (subError) throw subError;
      if (!subscriberData || (subscriberData.status !== "active" && subscriberData.status !== "grace")) {
        return new Response(JSON.stringify({ 
          error: "Active subscription required",
          redirect: "/subscribe" 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if user can add another pet
      const { count: currentPetCount } = await admin
        .from("pets")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const totalLimit = (subscriberData.pet_limit || 1) + (subscriberData.additional_pets || 0);
      if ((currentPetCount || 0) >= totalLimit) {
        return new Response(JSON.stringify({ 
          error: "Pet limit reached. Please upgrade your subscription.",
          redirect: "/subscribe?upgrade=pets" 
        }), {
          status: 402,
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
          status: "completed",
          accepted_at: new Date().toISOString(),
          to_user_id: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reqRow.id);
      if (reqUpdateErr) throw reqUpdateErr;

      // Send success email to recipient
      try {
        await admin.functions.invoke("send-email", {
          body: {
            type: "transfer_success",
            recipientEmail: reqRow.to_email,
            recipientName: user.user_metadata?.full_name,
            petName: reqRow.pets?.name || "Pet",
            petId: reqRow.pet_id,
            shareUrl: `${APP_ORIGIN}/profile/${reqRow.pet_id}`,
            senderName: reqRow.profiles?.full_name
          }
        });
      } catch (emailError) {
        console.error("Error sending success email:", emailError);
        // Don't fail the transfer for email issues
      }

      return new Response(JSON.stringify({ 
        ok: true,
        pet_name: reqRow.pets?.name,
        message: "Transfer completed successfully" 
      }), {
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

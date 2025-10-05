/create-referral/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    // Connect using service role key for secure inserts
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Expecting a JSON payload: { referralCode, referredUserId }
    const { referralCode, referredUserId } = await req.json();

    if (!referralCode || !referredUserId) {
      return new Response(
        JSON.stringify({ error: "Missing referralCode or referredUserId" }),
        { status: 400 }
      );
    }

    // Find the referrer by their referral code
    const { data: referrer, error: findError } = await supabase
      .from("referrals")
      .select("referrer_user_id")
      .eq("referral_code", referralCode)
      .maybeSingle();

    if (findError || !referrer) {
      return new Response(
        JSON.stringify({ error: "Invalid or unknown referral code" }),
        { status: 404 }
      );
    }

    // Create a new referral record for this signup
    const { error: insertError } = await supabase.from("referrals").insert([
      {
        referrer_user_id: referrer.referrer_user_id,
        referred_user_id: referredUserId,
        referral_code: referralCode,
        commission_amount: 200, // $2.00 in cents
        commission_status: "pending",
        referral_type: "yearly_plan",
      },
    ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Referral recorded" }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in create-referral:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
});

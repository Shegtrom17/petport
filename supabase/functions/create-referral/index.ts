import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { referralCode, referredUserId } = await req.json();

    if (!referralCode || !referredUserId) {
      return new Response(
        JSON.stringify({ error: "Missing referralCode or referredUserId" }),
        { status: 400 }
      );
    }

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

    const { error: insertError } = await supabase.from("referrals").insert([
      {
        referrer_user_id: referrer.referrer_user_id,
        referred_user_id: referredUserId,
        referral_code: referralCode,
        commission_amount: 200,
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

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const updateBillingPlan = async (shop, planId) => {
  try {
    const { data: shopData, error: selectError } = await supabase.from("shop").select().eq("id", shop).single();

    if (selectError) {
      throw new Error(selectError.message);
    }

    let daysPassed = 0;

    if (shopData?.billing_plan_start) {
      const startDate = new Date(shopData.billing_plan_start);
      const currentDate = new Date();
      daysPassed = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
    }

    let billing_plan_start = null;
    if (planId !== "free") {
      billing_plan_start = new Date().toISOString();
    }

    const billing_days_used = (shopData?.billing_days_used ?? 0) + Math.max(daysPassed, 0);
    console.log({
      shop,
      planId,
      billing_days_used,
      billing_plan_start,
      shopData,
    });

    const { error } = await supabase.from("shop").update({ billing_plan: planId, billing_days_used, billing_plan_start }).eq("id", shop);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error({
      shop,
      planId,
      error,
      message: "Error updating billing plan",
    });
    return false;
  }
};

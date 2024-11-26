import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const handleRiskAssessmentChanged = async (shop, order) => {
  try {
    const fraud_risk = order.risk_level;
    const order_id = order.order_id;
    if (fraud_risk && order_id) {
      const { data, error } = await supabase.from("order").upsert(
        {
          order_id,
          shop,
          fraud_risk,
        },
        {
          onConflict: ["order_id"],
        }
      );
    }
  } catch (error) {
    console.error("Error in handleRiskAssessmentChanged", {
      error,
      shop,
      order,
    });
  }
};

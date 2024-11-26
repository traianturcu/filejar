import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const handleOrderCancelled = async (shop, order) => {
  try {
    const cancelled_at = order.cancelled_at ? new Date(order.cancelled_at).toISOString() : null;
    await supabase
      .from("order")
      .update({
        cancelled_at,
      })
      .eq("order_id", order.id)
      .eq("shop", shop);
  } catch (error) {
    console.error("Error in handleOrderCancelled", {
      error,
      shop,
      order,
    });
  }
};

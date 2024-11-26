import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const handleOrderFulfilled = async (shop, order) => {
  try {
    const fulfillment_status = order.fulfillment_status;
    await supabase.from("order").update({ fulfillment_status }).eq("order_id", order.id).eq("shop", shop);
  } catch (error) {
    console.error("Error in handleOrderFulfilled", {
      error,
      shop,
      order,
    });
  }
};

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const handleOrderUpdated = async (shop, order) => {
  try {
    const { data: existingOrder } = await supabase.from("order").select("events, downloads, custom_files, access, status").eq("order_id", order.id).single();

    const events = existingOrder?.events ?? [];
    const downloads = existingOrder?.downloads ?? [];
    const custom_files = existingOrder?.custom_files ?? [];
    const access = existingOrder?.access ?? true;
    const status = existingOrder?.status ?? null;

    const created_at = order.created_at;
    const customer_id = order.customer?.id;
    const customer_email = order.customer?.email;
    const customer_first_name = order.customer?.first_name;
    const customer_last_name = order.customer?.last_name;
    const order_name = order.order_number;
    const order_id = order.id;
    const order_tags = order.tags;
    const payment_status = order.financial_status;
    const products = order.line_items;
    const note = order.note;
    const fulfillment_status = order.fulfillment_status;
    const currency = order.current_total_price_set?.shop_money?.currency_code;
    const total = order.current_total_price_set?.shop_money?.amount ? parseFloat(order.current_total_price_set.shop_money.amount) : 0;
    const cancelled_at = order.cancelled_at ? new Date(order.cancelled_at).toISOString() : null;

    events.push({
      action: "Order updated",
      updated_at: new Date().toISOString(),
    });

    await supabase.from("order").upsert(
      {
        shop,
        created_at,
        customer_id,
        customer_email,
        customer_first_name,
        customer_last_name,
        order_name,
        order_id,
        order_tags,
        payment_status,
        fulfillment_status,
        status,
        events,
        downloads,
        custom_files,
        products,
        note,
        access,
        details: order,
        currency,
        total,
        cancelled_at,
      },
      {
        onConflict: "order_id",
      }
    );
  } catch (error) {
    console.error("Error in handleOrderUpdated", {
      error,
      shop,
      order,
    });
  }
};

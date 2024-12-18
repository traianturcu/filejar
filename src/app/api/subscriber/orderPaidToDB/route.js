import { createClient } from "@supabase/supabase-js";
import { publish } from "@/lib/pubsub/publish";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const POST = async (req) => {
  try {
    const { Message } = await req.json();
    const { shop, order } = JSON.parse(Message);
    if (!shop || !order) {
      throw new Error("Shop or order not found");
    }

    const { data: existingOrder } = await supabase
      .from("order")
      .select("events, downloads, custom_files, access_enabled, status")
      .eq("order_id", order.id)
      .single();

    const events = existingOrder?.events ?? [];
    const downloads = existingOrder?.downloads ?? [];
    const custom_files = existingOrder?.custom_files ?? [];
    const access_enabled = existingOrder?.access_enabled;
    const status = existingOrder?.status ?? null;

    const created_at = order.created_at ? new Date(order.created_at).toISOString() : null;
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
      action: "Order paid",
      created_at,
    });

    const variant_ids = order?.line_items.map((item) => `gid://shopify/ProductVariant/${item.variant_id}`);

    const { count } = await supabase.from("product").select("*", { count: "exact", head: true }).eq("shop", shop).overlaps("variants", variant_ids);

    const is_digital = count > 0;

    const { error } = await supabase.from("order").upsert(
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
        access_enabled,
        details: order,
        currency,
        total,
        cancelled_at,
        is_digital,
      },
      {
        onConflict: "order_id",
      }
    );

    // send email
    await publish("SEND_ORDER_EMAIL", {
      shop,
      order,
    });

    return Response.json(
      {
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error handling orderPaidToDB", error);
    return Response.json(
      {
        success: false,
        error,
      },
      { status: 500 }
    );
  }
};

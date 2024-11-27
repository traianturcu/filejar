import { getShop } from "@/lib/shop";
import { createClient } from "@supabase/supabase-js";
import { filesPerPage } from "@/constants/files";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const GET = async (request) => {
  try {
    const shop = request?.headers?.get("X-Shop");
    const search = request?.nextUrl?.searchParams?.get("search");
    const page = request?.nextUrl?.searchParams?.get("page") || 1;
    const sortBy = request?.nextUrl?.searchParams?.get("sortBy");
    const sortOrder = request?.nextUrl?.searchParams?.get("sortOrder");
    const from = (page - 1) * filesPerPage;
    const to = from + filesPerPage - 1;

    if (!shop) {
      throw new Error("Missing shop");
    }

    let sortColumn = "created_at";
    if (sortBy === "total") {
      sortColumn = "total";
    }

    const ascending = sortOrder === "asc";

    const shopData = await getShop(shop);

    if (!shopData.uuid) {
      throw new Error("Shop UUID not found");
    }

    const escapedSearch = search.replace(/([%_\\])/g, "\\$1");

    const { data, count, error } = await supabase
      .from("order")
      .select("*", { count: "exact" })
      .eq("shop", shop)
      .eq("is_digital", true)
      .or(
        `order_name.ilike.%${escapedSearch}%,customer_email.ilike.%${escapedSearch}%,customer_first_name.ilike.%${escapedSearch}%,customer_last_name.ilike.%${escapedSearch}%`
      )
      .order(sortColumn, { ascending })
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    const orders = data.map((order) => ({
      id: order.id,
      order_name: order.order_name,
      order_id: order.order_id,
      status: order.status,
      fulfillment_status: order.fulfillment_status,
      payment_status: order.payment_status,
      cancelled_at: order.cancelled_at,
      total: order.total,
      currency: order.currency,
      customer_id: order.customer_id,
      customer_email: order.customer_email,
      customer_first_name: order.customer_first_name,
      customer_last_name: order.customer_last_name,
      created_at: order.created_at,
      fraud_risk: order.fraud_risk,
    }));

    return Response.json(
      {
        success: true,
        orders,
        count,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
};

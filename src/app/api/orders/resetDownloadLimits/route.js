import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const GET = async (request) => {
  try {
    const shop = request?.headers?.get("X-Shop");
    const id = request?.nextUrl?.searchParams?.get("id");

    if (!shop) {
      throw new Error("Missing shop");
    }

    await supabase.from("order").update({ downloads_count: {} }).eq("order_id", id).eq("shop", shop);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};

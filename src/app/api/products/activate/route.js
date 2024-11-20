import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const POST = async (request) => {
  try {
    const shop = request?.headers?.get("X-Shop");
    const { id } = await request.json();

    if (!shop) {
      throw new Error("Missing shop");
    }

    if (!id) {
      throw new Error("Missing product id");
    }

    const { data, error } = await supabase.from("product").update({ active: true }).eq("shop", shop).eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    if (data?.length === 0) {
      throw new Error("Failed to activate product");
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
};

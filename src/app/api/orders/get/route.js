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

    const { data, error } = await supabase.from("order").select("*").eq("shop", shop).eq("order_id", id).single();

    const variant_ids = data?.products?.map((product) => `gid://shopify/ProductVariant/${product.variant_id}`);

    const { data: products } = await supabase.from("product").select("*").eq("shop", shop).overlaps("variants", variant_ids);

    const file_names = products?.flatMap((product) => product?.files);

    const { data: files } = await supabase.schema("storage").from("objects").select("*", { count: "exact" }).eq("bucket_id", "uploads").in("name", file_names);

    if (error || !data) {
      throw new Error(error?.message || "Order not found");
    }

    return Response.json(
      {
        success: true,
        order: data,
        products,
        files,
        download_link: `https://${shop}/apps/${process.env.APP_HANDLE}/download/${data?.id}`,
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

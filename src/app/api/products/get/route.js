import { createClient } from "@supabase/supabase-js";
import { productsPerPage } from "@/constants/products";

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

    const { data: product, error } = await supabase.from("product").select("*").eq("shop", shop).eq("id", id).single();

    if (error) {
      throw new Error(error.message);
    }

    return Response.json(
      {
        success: true,
        product,
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

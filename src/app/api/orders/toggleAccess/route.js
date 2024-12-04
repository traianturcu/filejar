import { getShop } from "@/lib/shop";
import { createClient } from "@supabase/supabase-js";
import { filesPerPage } from "@/constants/files";

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

    const { data: order } = await supabase.from("order").select("*").eq("order_id", id).eq("shop", shop).single();

    const access_revoked = order?.access_revoked;

    const { data, error } = await supabase
      .from("order")
      .update({
        access_revoked: !access_revoked,
      })
      .eq("order_id", id)
      .eq("shop", shop);

    if (error) {
      throw new Error(error.message);
    }

    return Response.json(
      {
        success: true,
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

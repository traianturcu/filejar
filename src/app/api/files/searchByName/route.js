import { getShop } from "@/lib/shop";
import { createClient } from "@supabase/supabase-js";
import { filesPerPage } from "@/constants/files";

export const dynamic = "force-dynamic";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const POST = async (request) => {
  try {
    const shop = request?.headers?.get("X-Shop");
    const { names } = await request.json();

    if (!shop) {
      throw new Error("Missing shop");
    }

    const shopData = await getShop(shop);

    if (!shopData.uuid) {
      throw new Error("Shop UUID not found");
    }

    const { data, error } = await supabase.schema("storage").from("objects").select("*").in("name", names).order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const files = data.map((file) => ({
      id: file.id,
      name: file.name,
      originalFileName: file.user_metadata?.originalFileName,
      created_at: file.created_at,
      path_tokens: file.path_tokens,
      mimetype: file.metadata?.mimetype,
      size: file.metadata?.size,
    }));

    return Response.json(
      {
        success: true,
        files,
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

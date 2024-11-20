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
    if (sortBy === "name") {
      sortColumn = "user_metadata->>originalFileName";
    } else if (sortBy === "size") {
      sortColumn = "metadata->size";
    }

    const ascending = sortOrder === "asc";

    const shopData = await getShop(shop);

    if (!shopData.uuid) {
      throw new Error("Shop UUID not found");
    }

    const escapedSearch = search.replace(/([%_\\])/g, "\\$1");

    const { data, count, error } = await supabase
      .schema("storage")
      .from("objects")
      .select("*", { count: "exact" })
      .eq("bucket_id", "uploads")
      .eq("owner_id", shopData.uuid)
      .or(`user_metadata->>originalFileName.ilike.%${escapedSearch}%,metadata->>mimetype.ilike.%${escapedSearch}%`)
      .order(sortColumn, { ascending })
      .range(from, to);

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

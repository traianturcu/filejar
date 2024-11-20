import { createClient } from "@supabase/supabase-js";
import { productsPerPage } from "@/constants/products";

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
    const from = (page - 1) * productsPerPage;
    const to = from + productsPerPage - 1;

    if (!shop) {
      throw new Error("Missing shop");
    }

    let sortColumn = "created_at";
    if (sortBy === "name") sortColumn = "title";

    const ascending = sortOrder === "asc";

    const escapedSearch = search.replace(/([%_\\])/g, "\\$1");

    const { data, count, error } = await supabase
      .from("product")
      .select("*", { count: "exact" })
      .eq("shop", shop)
      .or(`gid.ilike.%${escapedSearch}%,title.ilike.%${escapedSearch}%`)
      .order(sortColumn, { ascending })
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    return Response.json(
      {
        success: true,
        products: data,
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

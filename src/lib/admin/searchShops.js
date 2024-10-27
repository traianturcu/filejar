import { createClient } from "@supabase/supabase-js";

export const searchShops = async (query) => {
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data, error } = await supabase
      .from("shop")
      .select()
      .or(
        `id.ilike.%${query}%,details->>name.ilike.%${query}%,details->>email.ilike.%${query}%,details->primaryDomain->>host.ilike.%${query}%,details->plan->>displayName.ilike.%${query}%`
      )
      .limit(25);

    if (error) {
      throw new Error(error.message);
    }

    const results = data?.map((shop) => {
      return { ...shop.details };
    });

    return results ?? [];
  } catch (error) {
    console.error({
      message: "Failed to search for shops as admin",
      query,
      error,
    });
    return [];
  }
};

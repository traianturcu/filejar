import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const getShopsToUpdate = async () => {
  try {
    // get shops that have last_update NULL or older than 24h in the database
    // limit to 100 shops
    const aDayAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase.from("shop").select("id, access_token").or(`last_update.is.null,last_update.lt.${aDayAgo}`).limit(100);
    if (error) {
      throw new Error(error.message);
    }
    return data ?? [];
  } catch (error) {
    console.error({
      error,
      message: "Error in getShopsToUpdate",
    });
    return [];
  }
};

import { createClient } from "@supabase/supabase-js";
import { publish } from "@/lib/pubsub/publish";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const updateIsDigital = async (shop, order) => {};

export default updateIsDigital;

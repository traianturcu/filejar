import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const GET = async (request, { params }) => {
  const { id } = params;

  // get the order_id and file_id from the download table
  const { data: download } = await supabase.from("download").select("order_id, file_id, shop").eq("id", id).single();
  const order_id = download?.order_id;
  const file_id = download?.file_id;
  const shop = download?.shop;

  const { data: file } = await supabase.schema("storage").from("objects").select("*").eq("bucket_id", "uploads").eq("id", file_id).single();

  if (!file) {
    return new Response("File not found", { status: 404 });
  }

  const file_name = file?.name;
  const original_file_name = file?.user_metadata?.originalFileName;
  const file_size = file?.metadata?.size;

  const { data: file_data } = await supabase.storage.from("uploads").createSignedUrl(file_name, 60, {
    download: true,
  });

  // aggregate the file size to keep track of consumed bandwidth
  const { data: shopData } = await supabase.from("shop").select("*").eq("id", shop).single();
  const bandwidth = shopData?.bandwidth ?? 0;
  const bandwidth_last_update = shopData?.bandwidth_last_update ? new Date(shopData.bandwidth_last_update) : null;
  if (!bandwidth_last_update || bandwidth_last_update < new Date(new Date().getFullYear(), new Date().getMonth(), 1)) {
    await supabase.from("shop").update({ bandwidth: file_size, bandwidth_last_update: new Date().toISOString() }).eq("id", shop);
  } else {
    await supabase
      .from("shop")
      .update({ bandwidth: bandwidth + file_size, bandwidth_last_update: new Date().toISOString() })
      .eq("id", shop);
  }

  const { data: downloads_data } = await supabase.from("order").select("*").eq("id", order_id).single();
  const downloads = downloads_data?.downloads ?? [];
  downloads.push({
    file_id,
    original_file_name: original_file_name,
    file_size: file_size,
    download_date: new Date().toISOString(),
  });
  await supabase.from("order").update({ downloads }).eq("id", order_id);
  const downloads_count = downloads_data?.downloads_count ?? {};
  downloads_count[file_id] = (downloads_count[file_id] ?? 0) + 1;
  await supabase.from("order").update({ downloads_count }).eq("id", order_id);

  return Response.redirect(`${file_data.signedUrl}${encodeURIComponent(original_file_name)}`, 302);
};

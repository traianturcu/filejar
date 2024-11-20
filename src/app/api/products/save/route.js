import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const POST = async (request) => {
  try {
    const shop = request?.headers?.get("X-Shop");
    const { autoFulfill, limitDownloads, limitDownloadTime, selectedProduct, selectedFiles, isEdit } = await request.json();

    if (!shop) {
      throw new Error("Missing shop");
    }

    if (!selectedProduct || !selectedFiles?.length) {
      throw new Error("Missing product or files");
    }

    if (isEdit) {
      // update product
    } else {
      // create product
      // if any of the variants already exist in a product, throw an error
      const { data, error } = await supabase.from("product").select("*").eq("shop", shop).overlaps("variants", selectedProduct.variants);
      if (error) {
        throw new Error(error.message);
      }
      if (data?.length > 0) {
        return Response.json({ success: false, code: "product_already_exists", error: "Product already exists" }, { status: 500 });
      }

      // create product
      const { dataCreate, errorCreate } = await supabase.from("product").insert({
        gid: selectedProduct.gid,
        shop,
        title: selectedProduct.title,
        image: selectedProduct.image,
        variants: selectedProduct.variants,
        totalVariants: selectedProduct.totalVariants,
        hasOnlyDefaultVariant: selectedProduct.hasOnlyDefaultVariant,
        files: selectedFiles,
        settings: { autoFulfill, limitDownloads, limitDownloadTime },
        details: selectedProduct.details,
      });

      if (errorCreate) {
        throw new Error(errorCreate.message);
      }

      if (dataCreate?.length === 0) {
        throw new Error("Failed to create product");
      }
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
};

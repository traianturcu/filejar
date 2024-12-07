import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const POST = async (request) => {
  try {
    const shop = request?.headers?.get("X-Shop");

    if (!shop) {
      throw new Error("Missing shop");
    }

    const formData = await request.formData();
    const logo = formData.get("logo");

    if (!logo || !(logo instanceof File)) {
      throw new Error("Missing logo");
    }

    const extension = logo.name.split(".").pop();

    const logoName = uuidv4() + "." + extension;

    const { data, error } = await supabase.storage.from("logo").upload(logoName, logo);

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({
      success: true,
      message: "Successfully uploaded logo",
      logo: logoName,
    });
  } catch (error) {
    console.error({
      error,
      message: "Error: Failed to upload logo",
    });
    return Response.json(
      {
        success: false,
        message: "Error: Failed to upload logo",
      },
      {
        status: 500,
      }
    );
  }
};

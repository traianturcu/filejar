import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const POST = async (request) => {
  try {
    const shop = request?.headers?.get("X-Shop");

    if (!shop) {
      throw new Error("Missing shop");
    }

    const { name } = await request.json();

    const { data, error } = supabase.storage.from("logo").getPublicUrl(name, {
      transform: {
        width: 600,
        resize: "contain",
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    const logoUrl = data.publicUrl;

    return Response.json({
      success: true,
      message: "logo URL retrieved",
      url: logoUrl,
    });
  } catch (error) {
    console.error({
      error,
      message: "Error: Failed to retrieve logo URL",
    });
    return Response.json(
      {
        success: false,
        message: "Error: Failed to retrieve logo URL",
      },
      {
        status: 500,
      }
    );
  }
};

import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const POST = async (request) => {
  try {
    const shop = request?.headers?.get("X-Shop");

    if (!shop) {
      throw new Error("Missing shop");
    }

    const { order_prefix, message, show_powered_by, button_text, button_background_color, button_text_color } = await request.json();

    const { data: shopData } = await supabase.from("shop").select("settings").eq("id", shop).single();

    const { error } = await supabase
      .from("shop")
      .update({
        settings: {
          ...shopData?.settings,
          download_page_template: {
            order_prefix,
            message,
            show_powered_by,
            button_text,
            button_background_color,
            button_text_color,
          },
        },
      })
      .eq("id", shop);

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({
      success: true,
      message: "Successfully saved download page template",
    });
  } catch (error) {
    console.error({
      error,
      message: "Error: Failed to save download page template",
    });
    return Response.json(
      {
        success: false,
        message: "Failed to save download page template",
      },
      {
        status: 500,
      }
    );
  }
};

import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const POST = async (request) => {
  try {
    const shop = request?.headers?.get("X-Shop");

    if (!shop) {
      throw new Error("Missing shop");
    }

    const {
      from_name,
      from_email,
      subject,
      greeting,
      body,
      product_list_header,
      thank_you_text,
      thank_you_signature,
      footer,
      show_powered_by,
      button_text,
      button_background_color,
      button_text_color,
      logo,
      logo_size,
      logo_link,
    } = await request.json();

    const { error } = await supabase
      .from("shop")
      .update({
        settings: {
          email_template: {
            from_name,
            from_email,
            subject,
            greeting,
            body,
            product_list_header,
            thank_you_text,
            thank_you_signature,
            footer,
            show_powered_by,
            button_text,
            button_background_color,
            button_text_color,
            logo,
            logo_size,
            logo_link,
          },
        },
      })
      .eq("id", shop);

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({
      success: true,
      message: "Successfully saved email template",
    });
  } catch (error) {
    console.error({
      error,
      message: "Error: Failed to save email template",
    });
    return Response.json(
      {
        success: false,
        message: "Failed to save email template",
      },
      {
        status: 500,
      }
    );
  }
};

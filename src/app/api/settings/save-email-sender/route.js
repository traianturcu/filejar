import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const POST = async (request) => {
  try {
    const shop = request?.headers?.get("X-Shop");

    if (!shop) {
      throw new Error("Missing shop");
    }

    const { senderEmail, senderName } = await request.json();

    const { error } = await supabase
      .from("shop")
      .update({
        sender_email: senderEmail,
        sender_name: senderName,
        sender_verified: false,
        cname_verified: false,
      })
      .eq("id", shop);

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({
      success: true,
      message: "Successfully saved email sender settings",
    });
  } catch (error) {
    console.error({
      error,
      message: "Error: Failed to save email sender settings",
    });
    return Response.json(
      {
        success: false,
        message: "Failed to save email sender settings",
      },
      {
        status: 500,
      }
    );
  }
};

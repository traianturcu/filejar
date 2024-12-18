import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const POST = async (request) => {
  try {
    const shop = request?.headers?.get("X-Shop");

    if (!shop) {
      throw new Error("Missing shop");
    }

    const { email } = await request.json();

    if (!email) {
      throw new Error("Missing email");
    }

    const { error } = await supabase
      .from("shop")
      .update({
        email_important: email,
      })
      .eq("id", shop);

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({
      success: true,
      message: "Successfully saved important email",
    });
  } catch (error) {
    console.error({
      error,
      message: "Error: Failed to save important email",
    });
    return Response.json(
      {
        success: false,
        message: "Failed to save important email",
      },
      {
        status: 500,
      }
    );
  }
};

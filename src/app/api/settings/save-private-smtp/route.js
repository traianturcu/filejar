import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const POST = async (request) => {
  try {
    const shop = request?.headers?.get("X-Shop");

    if (!shop) {
      throw new Error("Missing shop");
    }

    const { username, password, host, email } = await request.json();

    if (!username || !password || !host || !email) {
      throw new Error("Missing username, password, host or email");
    }

    const { error } = await supabase
      .from("shop")
      .update({
        private_smtp: {
          username: username?.replace(/ /g, ""),
          password: password?.replace(/ /g, ""),
          host: host?.replace(/ /g, "")?.replace(/^https?:\/\//, ""),
          email: email?.replace(/ /g, ""),
        },
      })
      .eq("id", shop);

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({
      success: true,
      message: "Successfully saved private SMTP server",
    });
  } catch (error) {
    console.error({
      error,
      message: "Error: Failed to save private SMTP server",
    });
    return Response.json(
      {
        success: false,
        message: "Failed to save private SMTP server",
      },
      {
        status: 500,
      }
    );
  }
};

import { updateImportantEmail } from "@/lib/shop";

export const revalidate = 0;

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const isValid = emailRegex.test(email);

    if (!isValid) {
      throw new Error("Invalid email");
    }

    const result = await updateImportantEmail(shop, email);

    if (!result) {
      throw new Error("Failed to save important email");
    }

    return Response.json({
      success: true,
      message: "Successfully saved important email",
    });
  } catch (error) {
    console.error({
      error,
      message: "Failed to save important email",
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

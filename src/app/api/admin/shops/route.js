import { searchShops } from "@/lib/admin";

export const POST = async (request) => {
  try {
    const { query } = await request.json();
    const shops = await searchShops(query ?? "");
    return Response.json({
      success: true,
      shops,
    });
  } catch (error) {
    console.error({
      message: "Failed to search for shops as admin",
      error,
    });
    return Response(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
};

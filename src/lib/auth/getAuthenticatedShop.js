import * as jose from "jose";

const jwtConfig = {
  secret: new TextEncoder().encode(process.env.SHOPIFY_API_SECRET_KEY),
};

export const getAuthenticatedShop = async (request) => {
  try {
    const token = request?.headers?.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new Error("Token is missing");
    }

    const { payload } = await jose.jwtVerify(token, jwtConfig.secret);

    return payload?.dest?.replace(/^https?:\/\//, "") ?? null;
  } catch (error) {
    console.error({
      error,
      request,
      message: "likely a bot accessing an /api endpoint without a session token (getAuthenticatedShop)",
    });
    return null;
  }
};

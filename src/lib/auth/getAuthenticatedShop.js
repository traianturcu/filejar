import * as jose from "jose";

const jwtConfig = {
  secret: new TextEncoder().encode(process.env.SHOPIFY_API_SECRET_KEY),
};

export const getAuthenticatedShop = async (request) => {
  try {
    const token = request?.headers?.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      // throw new Error("Token is missing");
      // do not throw error, just return null
      // because this can get triggered by Shopify bots visiting the URL without a token
      // avoid logalert
      return null;
    }

    const { payload } = await jose.jwtVerify(token, jwtConfig.secret);

    return payload?.dest?.replace(/^https?:\/\//, "") ?? null;
  } catch (error) {
    console.error({
      error,
      request,
      message: "Error in getAuthenticatedShop",
    });
    return null;
  }
};

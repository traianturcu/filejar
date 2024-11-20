import { getShop } from "@/lib/shop";
import * as jose from "jose";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const jwtConfig = {
  secret: new TextEncoder().encode(process.env.SHOPIFY_API_SECRET_KEY),
};

export const GET = async (request) => {
  try {
    const shop = request?.headers?.get("X-Shop");

    if (!shop) {
      throw new Error("Shop header is missing");
    }

    const data = await getShop(shop);

    if (!data.uuid) {
      throw new Error("Shop UUID not found");
    }

    //generate a JWT token using the shop UUID and process.env.SHOPIFY_API_SECRET_KEY
    const token = await new jose.SignJWT()
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setIssuer("filejar")
      .setAudience("supabase")
      .setSubject(data.uuid)
      .setExpirationTime("24h")
      .sign(jwtConfig.secret);

    return Response.json(
      {
        success: true,
        token,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return Response.json(
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

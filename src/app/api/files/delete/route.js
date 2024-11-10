import { getShop } from "@/lib/shop";
import * as jose from "jose";
import { createClient } from "@supabase/supabase-js";

const jwtConfig = {
  secret: new TextEncoder().encode(process.env.SHOPIFY_API_SECRET_KEY),
};

export const POST = async (request) => {
  try {
    const shop = request?.headers?.get("X-Shop");
    const { ids } = await request.json();

    if (!shop) {
      throw new Error("Shop header is missing");
    }

    if (!ids) {
      throw new Error("Ids are missing");
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

    const supabase = createClient(process.env.SUPABASE_URL, token);

    const { data: files, error } = await supabase.storage.from("uploads").remove(ids);

    if (error) {
      throw new Error(error.message);
    }

    return Response.json(
      {
        success: true,
        files,
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

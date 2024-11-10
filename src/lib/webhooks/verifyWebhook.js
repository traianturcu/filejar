import crypto from "crypto";

export const verifyWebhook = async (request) => {
  try {
    const hmac = request?.headers?.get("x-shopify-hmac-sha256");
    const topic = request?.headers?.get("x-shopify-topic");
    const shop = request?.headers?.get("x-shopify-shop-domain");

    if (!hmac || !topic || !shop) {
      return {
        valid: false,
      };
    }

    const rawBody = await request.text();
    const body = JSON.parse(rawBody.toString("utf8"));
    const computedHmac = crypto.createHmac("sha256", process.env.SHOPIFY_API_SECRET_KEY).update(rawBody, "utf8", "hex").digest("base64");
    const hmac_buffer = Buffer.from(hmac, "utf8");
    const computedHmac_buffer = Buffer.from(computedHmac, "utf8");

    const valid = hmac_buffer.length === computedHmac_buffer.length && crypto.timingSafeEqual(hmac_buffer, computedHmac_buffer);

    return {
      valid,
      topic,
      shop,
      body,
    };
  } catch (error) {
    console.error({
      msg: "Error verifying webhook",
      error,
    });
    return {
      valid: false,
    };
  }
};

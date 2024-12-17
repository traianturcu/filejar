export const tokenExchange = async (shop, sessionToken) => {
  try {
    const url = `https://${shop}/admin/oauth/access_token`;
    const body = {
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET_KEY,
      subject_token: sessionToken,
      grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
      subject_token_type: "urn:ietf:params:oauth:token-type:id_token",
      requested_token_type: "urn:shopify:params:oauth:token-type:offline-access-token",
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Failed to exchange token: ${res.status} - ${await res.text()}`);
    }

    const { access_token } = await res.json();

    return access_token;
  } catch (error) {
    console.error({
      error,
      shop,
      sessionToken,
      message: "Error in tokenExchange",
    });
    return null;
  }
};

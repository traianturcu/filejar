export const getActiveCharge = async (shop, accessToken) => {
  try {
    const url = `https://${shop}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`;
    const query = `query {
      appInstallation {
        activeSubscriptions {
          id
        }
      }
    }`;
    const variables = {};
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });
    const json = await response.json();
    const { data, errors } = json;
    if (errors) {
      throw new Error(JSON.stringify(errors));
    }

    return data?.appInstallation?.activeSubscriptions?.[0]?.id ?? null;
  } catch (error) {
    console.error({
      shop,
      accessToken,
      error,
      message: "Error getting active charge",
    });
    return null;
  }
};

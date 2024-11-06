export const cancelCharge = async (shop, accessToken, chargeId) => {
  try {
    const url = `https://${shop}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`;
    const query = `mutation AppSubscriptionCancel($id: ID!){
      appSubscriptionCancel(id: $id) {
        userErrors {
          field
          message
        }
      }
    }`;
    const variables = {
      id: chargeId,
    };
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });
    const json = await response.json();
    const { data, errors } = json;
    if (errors) {
      throw new Error(JSON.stringify(errors));
    }
    const userErrors = data?.appSubscriptionCancel?.userErrors;
    if (userErrors && userErrors.length) {
      throw new Error(JSON.stringify(userErrors));
    }

    return true;
  } catch (error) {
    console.error("Failed to cancel charge", error);
    return false;
  }
};

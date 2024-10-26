export const requestShopDetails = async (shop, access_token) => {
  try {
    const url = `https://${shop}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`;
    const query = `
      query shopInfo {
        shop {
          billingAddress {
            address1
            address2
            city
            company
            country
            countryCodeV2
            formatted
            formattedArea
            id
            latitude
            longitude
            phone
            province
            provinceCode
            zip
          }
          contactEmail
          createdAt
          currencyCode
          currencyFormats {
            moneyFormat
            moneyInEmailsFormat
            moneyWithCurrencyFormat
            moneyWithCurrencyInEmailsFormat
          }
          description
          email
          enabledPresentmentCurrencies
          id
          myshopifyDomain
          name
          orderNumberFormatPrefix
          orderNumberFormatSuffix
          plan {
            displayName
            partnerDevelopment
            shopifyPlus
          }
          primaryDomain {
            host
            id
            sslEnabled
            url
          }
          shopOwnerName
          url
          weightUnit
        }
      }
    `;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": access_token,
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch shop details from Shopify API");
    }

    const {
      data: { shop: details },
    } = await res.json();

    if (!details) {
      throw new Error("Details missing from Shopify API response");
    }

    return details;
  } catch (error) {
    console.error({
      error,
      shop,
      access_token,
      message: "Error in requestShopDetails",
    });
    return null;
  }
};

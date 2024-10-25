import { createClient } from "@supabase/supabase-js";

export const verifyShopDetails = async (shop) => {
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data } = await supabase.from("shop").select().eq("id", shop).single();

    if (!data?.details && data?.access_token) {
      const access_token = data.access_token;
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
        throw new Error("Failed to fetch shop details");
      }

      const {
        data: { shop: details },
      } = await res.json();

      if (!details) {
        throw new Error("Failed to fetch shop details");
      }

      const { error } = await supabase.from("shop").upsert({ id: shop, details }, { onConflict: ["id"] });

      if (error) {
        throw new Error("Error upserting shop details: " + error.message);
      }

      return true; // should refetch shop details
    } else {
      return false; // no need to refetch shop details
    }
  } catch (error) {
    console.error({
      error,
      shop,
      sessionToken,
      message: "Error in verifyShopDetails",
    });
    return false; // no need to refetch shop details, as there was an error
  }
};

import { getShop } from "@/lib/shop";
import { saveCharge, getActiveCharge, cancelCharge, updateBillingPlan } from "@/lib/billing";

export const createCharge = async (shop, plan) => {
  try {
    const shop_data = await getShop(shop);
    const access_token = shop_data?.access_token;
    const details = shop_data?.details;
    const offers = shop_data?.offers?.find((offer) => offer.id === plan.id);

    if (!plan.amount) {
      // free plan - cancel active charge if any
      const chargeId = await getActiveCharge(shop, access_token);

      if (chargeId) {
        await cancelCharge(shop, access_token, chargeId);
      }

      await updateBillingPlan(shop, "free");

      return {
        success: true,
        message: "Free plan selected",
        redirect: null,
      };
    }

    if (!access_token) {
      throw new Error("Access token is missing");
    }

    // TODO: implement ability to provide discounts
    const discount = {};

    if (offers?.discountPercentage) {
      if (offers?.durationLimitInIntervals) {
        discount.durationLimitInIntervals = parseInt(offers.durationLimitInIntervals);
      }
      discount.value = {
        percentage: parseFloat(offers.discountPercentage) / 100,
      };
    } else if (offers?.discountAmount) {
      if (offers?.durationLimitInIntervals) {
        discount.durationLimitInIntervals = parseInt(offers.durationLimitInIntervals);
      }
      discount.value = {
        amount: offers.discountAmount,
      };
    }

    // subtract the used billing days from the default plan trial days
    let daysPassed = 0;

    if (shop_data?.billing_plan_start) {
      const startDate = new Date(shop_data.billing_plan_start);
      const currentDate = new Date();
      daysPassed = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
    }

    const billing_days_used = (shop_data?.billing_days_used ?? 0) + Math.max(daysPassed, 0);
    const extendedDays = offers?.extendedFreeTrial ? parseInt(offers.extendedFreeTrial) : 0;
    const trialDays = Math.max(Math.max(plan.trialDays || 0, extendedDays) - billing_days_used, 0);

    const url = `https://${shop}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`;
    const query = `mutation AppSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $trialDays: Int, $test: Boolean){
      appSubscriptionCreate(name: $name, returnUrl: $returnUrl, lineItems: $lineItems, trialDays: $trialDays, test: $test) {
        userErrors {
          field
          message
        }
        appSubscription {
          id
        }
        confirmationUrl
      }
    }`;
    const variables = {
      name: `${process.env.APP_NAME} - ${plan.name} Plan`,
      returnUrl: `${process.env.APP_URL}/api/billing/confirm-charge?shop=${shop}`,
      trialDays,
      test: process.env.BILLING_TEST === "true" || details?.plan?.partnerDevelopment,
      lineItems: [
        {
          plan: {
            appRecurringPricingDetails: {
              price: {
                amount: plan.amount,
                currencyCode: "USD",
              },
              ...(discount && { discount }),
            },
          },
        },
      ],
    };
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": access_token,
      },
      body: JSON.stringify({ query, variables }),
    });
    const json = await response.json();
    const { data, errors } = json;
    if (errors) {
      throw new Error(JSON.stringify(errors));
    }

    const userErrors = data?.appSubscriptionCreate?.userErrors;

    if (userErrors && userErrors.length) {
      throw new Error(JSON.stringify(userErrors));
    }

    const redirect = data?.appSubscriptionCreate?.confirmationUrl;

    if (!redirect) {
      throw new Error("Error creating charge - no confirmation URL.");
    }

    const charge_id = data?.appSubscriptionCreate?.appSubscription?.id;

    if (!charge_id) {
      throw new Error("Error creating charge - no charge ID.");
    }

    const res = await saveCharge(shop, plan.id, charge_id);

    if (!res) {
      throw new Error("Error saving charge");
    }

    return {
      success: true,
      message: "Charge created successfully",
      redirect,
    };
  } catch (error) {
    console.error({
      shop,
      plan,
      error,
      message: "Error creating charge",
    });
    return {
      success: false,
      message: error.message,
      redirect: null,
    };
  }
};

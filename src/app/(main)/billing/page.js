"use client";

import SegmentTrack from "@/components/SegmentTrack";
import { BlockStack, Card, InlineGrid, InlineStack, Layout, Page, Text } from "@shopify/polaris";
import { billingPlans } from "@/constants/billingPlans";
import BillingPlanCard from "@/components/BillingPlanCard";
import { useShopDetails } from "@/components/ShopDetailsContext";
import { useEffect, useState } from "react";

const BillingPage = () => {
  const { shopDetails } = useShopDetails();
  const [planName, setPlanName] = useState(null);

  useEffect(() => {
    if (shopDetails?.billing_plan) {
      const plan = billingPlans.find((plan) => plan.id === shopDetails.billing_plan);
      setPlanName(plan?.name ?? null);
    }
  }, [shopDetails?.billing_plan]);

  return (
    <Page title="Billing">
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {planName && (
              <Card>
                <Text
                  as="h2"
                  variant="bodyLg"
                >
                  You are currently subscribed to the <strong>{planName}</strong> plan.
                </Text>
              </Card>
            )}
            <InlineGrid
              gap="300"
              columns={{ sm: 1, md: 3 }}
            >
              {billingPlans.map((plan) => {
                if (plan.id !== "free") {
                  return (
                    <BillingPlanCard
                      key={plan.id}
                      plan={plan}
                      billing_plan={shopDetails?.billing_plan}
                      billing_days_used={shopDetails?.billing_days_used}
                      billing_plan_start={shopDetails?.billing_plan_start}
                      offers={shopDetails?.offers?.find((offer) => offer.id === plan.id)}
                    />
                  );
                }
              })}
            </InlineGrid>
            {billingPlans.map((plan) => {
              if (plan.id === "free") {
                return (
                  <BillingPlanCard
                    key={plan.id}
                    plan={plan}
                    billing_plan={shopDetails?.billing_plan}
                    billing_days_used={shopDetails?.billing_days_used}
                    billing_plan_start={shopDetails?.billing_plan_start}
                    offers={shopDetails?.offers?.find((offer) => offer.id === plan.id)}
                  />
                );
              }
            })}
          </BlockStack>
        </Layout.Section>
      </Layout>
      <SegmentTrack
        event="view_page"
        properties={{
          page: "billing",
          billing_plan: shopDetails?.billing_plan,
        }}
      />
    </Page>
  );
};

export default BillingPage;

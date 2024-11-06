"use client";

import SegmentTrack from "@/components/SegmentTrack";
import { BlockStack, Card, InlineStack, Layout, Page, Text } from "@shopify/polaris";
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
            <InlineStack
              gap="500"
              align="space-between"
              blockAlign="stretch"
            >
              {billingPlans.map((plan) => (
                <BillingPlanCard
                  key={plan.id}
                  plan={plan}
                  billing_plan={shopDetails?.billing_plan}
                  billing_days_used={shopDetails?.billing_days_used}
                  billing_plan_start={shopDetails?.billing_plan_start}
                />
              ))}
            </InlineStack>
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

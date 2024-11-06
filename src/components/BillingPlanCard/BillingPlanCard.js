"use client";

import { useState } from "react";
import { BlockStack, Box, Button, Card, InlineStack, List, Text } from "@shopify/polaris";
import { selectPlan } from "@/lib/client/billing";

const BillingPlanCard = ({ plan, billing_plan, billing_plan_start, billing_days_used }) => {
  const [loading, setLoading] = useState(false);

  const handlePlanSwitch = async () => {
    setLoading(true);
    await selectPlan(plan.id);
  };

  let daysPassed = 0;

  if (billing_plan_start) {
    const startDate = new Date(billing_plan_start);
    const currentDate = new Date();
    daysPassed = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
  }

  const daysUsed = (billing_days_used ?? 0) + Math.max(daysPassed, 0);
  const trialDays = Math.max((plan.trialDays || 0) - daysUsed, 0);

  return (
    <div style={{ flex: 1 }}>
      <Card roundedAbove="sm">
        <BlockStack gap="500">
          <Text
            as="h2"
            variant="headingLg"
          >
            {plan.name}
          </Text>
          <Box
            minHeight="200px"
            minWidth="250px"
          >
            <BlockStack
              gap="500"
              inlineAlign="start"
              align="space-between"
            >
              <Text
                as="p"
                variant="bodySm"
              >
                {plan.description}
              </Text>
              <List type="bullet">
                {plan.benefits?.map((benefit, index) => {
                  return <List.Item key={index}>{benefit}</List.Item>;
                })}
              </List>
            </BlockStack>
          </Box>
          <InlineStack
            gap="200"
            align="space-between"
            blockAlign="center"
          >
            <Text
              as="span"
              variant="bodyLg"
              fontWeight="semibold"
            >
              {plan.price ?? ""}
            </Text>
            <Text
              as="span"
              variant="bodyXs"
              fontWeight="semibold"
            >
              {trialDays && trialDays > 0 && billing_plan ? `${trialDays}-DAY FREE TRIAL` : ""}
            </Text>
          </InlineStack>
          <Button
            size="large"
            variant="primary"
            fullWidth
            disabled={plan.id === billing_plan}
            onClick={handlePlanSwitch}
            loading={loading || !billing_plan}
          >
            {plan.id === billing_plan ? "Current Plan" : "Select Plan"}
          </Button>
        </BlockStack>
      </Card>
    </div>
  );
};

export default BillingPlanCard;

"use client";

import { useState } from "react";
import { Badge, BlockStack, Box, Button, Card, InlineStack, List, Text } from "@shopify/polaris";
import { selectPlan } from "@/lib/client/billing";
import { billingCardHeight } from "@/constants/billingPage";

const BillingPlanCard = ({ plan, billing_plan, billing_plan_start, billing_days_used, offers }) => {
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
  const extendedDays = offers?.extendedFreeTrial ? parseInt(offers.extendedFreeTrial) : 0;
  const trialDays = Math.max(Math.max(plan.trialDays || 0, extendedDays) - daysUsed, 0);

  let discount = null;
  let discountDuration = "(Lifetime)";
  let originalPrice = "";
  let discountedPrice = `${plan.amount}/month`;

  if (offers?.discountAmount) {
    discount = `$${offers.discountAmount}`;
    originalPrice = `$${plan.amount}`;
    const discountedAmount = Math.max(plan.amount - offers.discountAmount, 0);
    if (discountedAmount <= 0) {
      discountedPrice = "Free";
    } else {
      discountedPrice = `$${discountedAmount.toFixed(2)}/month`;
    }
  }

  if (offers?.discountPercentage) {
    discount = `${offers.discountPercentage}%`;
    originalPrice = `$${plan.amount}`;
    const discountedAmount = 1 - plan.amount * (parseFloat(offers.discountPercentage) / 100);
    if (discountedAmount <= 0) {
      discountedPrice = "Free";
    } else {
      discountedPrice = `$${discountedAmount.toFixed(2)}/month`;
    }
  }

  if (offers?.durationLimitInIntervals) {
    discountDuration = `(${offers.durationLimitInIntervals} ${offers.durationLimitInIntervals === 1 ? "Month" : "Months"})`;
  }

  return (
    <div
      style={{
        flex: 1,
        ...(plan.recommended && {
          filter: "drop-shadow(0 0 20px rgba(156, 106, 222, 0.8))",
        }),
      }}
    >
      <Card roundedAbove="sm">
        <BlockStack gap="500">
          <InlineStack
            gap="200"
            align="space-between"
            blockAlign="center"
          >
            <Text
              as="h2"
              variant="headingLg"
            >
              {plan.name}
            </Text>
            {plan.recommended && (
              <Badge
                tone="magic"
                progress="complete"
              >
                RECOMMENDED
              </Badge>
            )}
          </InlineStack>
          <Box minHeight={billingCardHeight}>
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
              {(offers?.extendedFreeTrial || discount) && (
                <>
                  <Text
                    as="p"
                    variant="bodySm"
                    fontWeight="bold"
                  >
                    UNLOCKED EXCLUSIVE OFFERS 🎉
                  </Text>
                  <InlineStack
                    gap="200"
                    align="center"
                    blockAlign="center"
                  >
                    {offers?.extendedFreeTrial && (
                      <Badge
                        size="small"
                        tone="info"
                      >
                        {offers.extendedFreeTrial}-Day Extended Trial
                      </Badge>
                    )}
                    {discount && (
                      <Badge
                        size="small"
                        tone="success"
                      >
                        {discount} OFF {discountDuration}
                      </Badge>
                    )}
                  </InlineStack>
                </>
              )}
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
            >
              {plan.amount ? (
                <>
                  <s>{originalPrice}</s> <b>{discountedPrice}</b>
                </>
              ) : (
                <b>Free</b>
              )}
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

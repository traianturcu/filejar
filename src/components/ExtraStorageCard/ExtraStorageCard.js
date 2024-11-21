"use client";

import { BlockStack, Button, Card, Icon, InlineStack, Text } from "@shopify/polaris";
import { useShopDetails } from "@/components/ShopDetailsContext";
import { ChatIcon, RewardIcon } from "@shopify/polaris-icons";

const ExtraStorageCard = () => {
  const { shopDetails } = useShopDetails();
  const billing_plan = shopDetails?.billing_plan;
  const planOffers = shopDetails?.offers?.find((o) => o.id === billing_plan);

  if (billing_plan === "free" && !planOffers?.total_storage) {
    return (
      <Card>
        <BlockStack
          gap="400"
          inlineAlign="start"
        >
          <InlineStack
            gap="150"
            align="start"
            blockAlign="center"
          >
            <div style={{ width: "20px" }}>
              <Icon
                source={RewardIcon}
                tone="success"
              />
            </div>
            <Text
              as="h5"
              variant="headingSm"
            >
              1GB Extra Storage
            </Text>
          </InlineStack>
          <Text
            as="p"
            variant="bodyMd"
          >
            Are you just getting started? We want to help you get off the ground with <b>1GB extra storage</b>.<br />
            Chat with us to verify your store and <b>get your limits increased for free</b>.
          </Text>
          <Button
            size="large"
            icon={ChatIcon}
            onClick={() => {
              window.Intercom("showNewMessage", "I'd like to verify my store and claim my 1GB extra storage");
            }}
          >
            Chat with us
          </Button>
        </BlockStack>
      </Card>
    );
  }

  return null;
};

export default ExtraStorageCard;

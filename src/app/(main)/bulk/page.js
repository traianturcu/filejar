"use client";

import { useState, useEffect } from "react";
import { useShopDetails } from "@/components/ShopDetailsContext";
import { Badge, Button, Icon, InlineStack, Layout, Page, Text } from "@shopify/polaris";
import { LockFilledIcon } from "@shopify/polaris-icons";
import { useRouter } from "next/navigation";
import UpgradeCard from "@/components/UpgradeCard";

const BulkPage = () => {
  const { shopDetails } = useShopDetails();
  const router = useRouter();
  const [secret, setSecret] = useState(null);

  useEffect(() => {
    const runEffect = async () => {
      const res = await fetch("/api/paid/secret");
      const data = await res.json();
      if (data?.secret) {
        setSecret(data.secret);
      }
    };

    runEffect();
  }, []);

  if (!shopDetails || !router) {
    return (
      <>
        <h1>Loading...</h1>
      </>
    );
  }

  if (shopDetails.billing_plan === "free") {
    return (
      <Page
        narrowWidth
        title="Bulk Actions"
        titleMetadata={
          <Badge tone="critical">
            <InlineStack
              gap="100"
              blockAlign="center"
              align="center"
              wrap={false}
            >
              <Icon source={LockFilledIcon} />
              <Text
                as="span"
                variant="bodySm"
              >
                Pro Feature
              </Text>
            </InlineStack>
          </Badge>
        }
      >
        <Layout>
          <Layout.Section>
            <UpgradeCard />
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <>
      <h1>Bulk Page</h1>
      <p>Welcome {shopDetails.billing_plan} User!</p>
      <p>Secret: {secret ?? "loading..."}</p>
    </>
  );
};

export default BulkPage;

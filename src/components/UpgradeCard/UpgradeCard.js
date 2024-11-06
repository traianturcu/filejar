"use client";

import { BlockStack, Button, Card, Text } from "@shopify/polaris";
import { KeyIcon } from "@shopify/polaris-icons";
import Image from "next/image";
import { useRouter } from "next/navigation";

const UpgradeCard = () => {
  const router = useRouter();

  return (
    <Card roundedAbove="sm">
      <BlockStack
        gap="500"
        inlineAlign="center"
      >
        <Image
          src="/images/upgrade.svg"
          width={400}
          height={200}
          alt="Upgrade"
        />
        <Text
          as="h2"
          variant="bodyLg"
          alignment="center"
        >
          This feature is not available on your current plan.
        </Text>
        <Button
          variant="primary"
          size="large"
          onClick={() => router.push("/billing")}
          icon={KeyIcon}
        >
          Upgrade to unlock it
        </Button>
      </BlockStack>
    </Card>
  );
};

export default UpgradeCard;

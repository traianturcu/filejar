import { Card, BlockStack, InlineStack, Badge, Button, Text } from "@shopify/polaris";
import { PersonLockFilledIcon } from "@shopify/polaris-icons";
import { useRouter } from "next/navigation";

const LockedBanner = ({ message = "This feature is only available on paid plans. Please upgrade to enable it.", badge = "PAID FEATURE" }) => {
  const router = useRouter();

  return (
    <div
      style={{
        flex: 1,
        filter: "drop-shadow(0 0 10px rgba(156, 106, 222, 0.8))",
      }}
    >
      <Card roundedAbove="sm">
        <BlockStack
          gap="200"
          align="start"
          inlineAlign="space-between"
        >
          <InlineStack
            gap="200"
            align="space-between"
          >
            <Badge
              tone="magic"
              progress="complete"
            >
              {badge}
            </Badge>
            <Button
              variant="primary"
              icon={PersonLockFilledIcon}
              onClick={() => {
                router.push("/billing");
              }}
            >
              Upgrade
            </Button>
          </InlineStack>

          <Text variant="bodyMd">{message}</Text>
        </BlockStack>
      </Card>
    </div>
  );
};

export default LockedBanner;

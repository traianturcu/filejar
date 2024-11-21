"use client";

import UsageCard from "@/components/UsageCard";
import ExtraStorageCard from "@/components/ExtraStorageCard";
import { BlockStack, Layout, Page } from "@shopify/polaris";
import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter();

  return (
    <Page
      narrowWidth
      title="Dashboard"
      primaryAction={{
        content: "Create a digital product",
        onClick: () => {
          router.push("/products/add");
        },
      }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <ExtraStorageCard />
            <UsageCard />
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Home;

"use client";

import { Page, Layout, Text } from "@shopify/polaris";

const ProductsPage = () => {
  return (
    <Page
      narrowWidth
      title="Products"
    >
      <Layout>
        <Layout.Section>
          <Text>Products</Text>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default ProductsPage;

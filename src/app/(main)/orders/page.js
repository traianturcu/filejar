"use client";

import { Page, Layout } from "@shopify/polaris";
import OrdersList from "@/components/OrdersList";

const OrdersPage = () => {
  return (
    <Page title="Orders">
      <Layout>
        <Layout.Section>
          <OrdersList />
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default OrdersPage;

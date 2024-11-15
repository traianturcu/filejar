"use client";

import { Page, Layout, Text } from "@shopify/polaris";

const SettingsPage = () => {
  return (
    <Page
      narrowWidth
      title="Settings"
    >
      <Layout>
        <Layout.Section>
          <Text>Settings</Text>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default SettingsPage;

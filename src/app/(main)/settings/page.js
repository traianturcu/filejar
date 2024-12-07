"use client";

import { useShopDetails } from "@/components/ShopDetailsContext";
import { Page, Layout, Text, Card, BlockStack, Listbox, InlineStack, Icon, OptionList, Button, FormLayout, TextField } from "@shopify/polaris";
import { PageDownIcon, EmailIcon, EmailNewsletterIcon, EditIcon, SendIcon } from "@shopify/polaris-icons";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SettingsPage = () => {
  const [selectedOption, setSelectedOption] = useState(["email"]);

  const { shopDetails } = useShopDetails();
  const router = useRouter();

  const customizeEmailTemplate = () => {
    router.push("/settings/email-template");
  };

  return (
    <Page title="Settings">
      <Layout>
        <Layout.Section variant="oneThird">
          <Card roundedAbove="sm">
            <BlockStack gap="200">
              <OptionList
                selected={selectedOption}
                onChange={setSelectedOption}
                options={[
                  {
                    label: "Email",
                    value: "email",
                    media: <Icon source={EmailIcon} />,
                  },
                  {
                    label: "Download Page",
                    value: "download-page",
                    media: <Icon source={PageDownIcon} />,
                  },
                ]}
              />
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          {selectedOption?.[0] === "email" && (
            <BlockStack gap="200">
              <Card roundedAbove="sm">
                <BlockStack
                  gap="200"
                  align="start"
                  inlineAlign="space-between"
                >
                  <InlineStack
                    gap="200"
                    align="space-between"
                    blockAlign="center"
                  >
                    <InlineStack
                      gap="100"
                      align="center"
                      blockAlign="center"
                    >
                      <Icon source={EmailNewsletterIcon} />
                      <Text
                        variant="bodyLg"
                        fontWeight="bold"
                        as="h3"
                      >
                        Email Template
                      </Text>
                    </InlineStack>
                    <Button
                      variant="primary"
                      icon={EditIcon}
                      onClick={customizeEmailTemplate}
                    >
                      Customize
                    </Button>
                  </InlineStack>
                  <Text variant="bodyMd">Customize the email template to match your brand.</Text>
                </BlockStack>
              </Card>
              <Card roundedAbove="sm">
                <BlockStack
                  gap="200"
                  align="start"
                  inlineAlign="space-between"
                >
                  <InlineStack
                    gap="200"
                    align="space-between"
                    blockAlign="center"
                  >
                    <InlineStack
                      gap="100"
                      align="center"
                      blockAlign="center"
                    >
                      <Icon source={SendIcon} />
                      <Text
                        variant="bodyLg"
                        fontWeight="bold"
                        as="h3"
                      >
                        Email Sender
                      </Text>
                    </InlineStack>
                  </InlineStack>
                  <FormLayout>
                    <FormLayout.Group>
                      <TextField
                        placeholder={shopDetails?.name}
                        label="Name"
                      />
                      <TextField
                        placeholder={shopDetails?.email}
                        label="Email"
                        readOnly
                        disabled
                      />
                    </FormLayout.Group>
                  </FormLayout>
                </BlockStack>
              </Card>
            </BlockStack>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default SettingsPage;

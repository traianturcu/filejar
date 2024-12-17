"use client";

import { useEffect, useState } from "react";
import {
  BlockStack,
  Button,
  Card,
  Icon,
  InlineStack,
  Text,
  FormLayout,
  TextField,
  Banner,
  Link,
  Box,
  DataTable,
  Spinner,
  IndexTable,
  Badge,
} from "@shopify/polaris";
import { useShopDetails } from "@/components/ShopDetailsContext";
import { EmailNewsletterIcon, EditIcon, SendIcon, ShieldCheckMarkIcon, ClipboardIcon } from "@shopify/polaris-icons";
import { useRouter } from "next/navigation";
import isCommonEmailAddress from "@/lib/utils/isCommonEmailAddress";
import { Modal, TitleBar } from "@shopify/app-bridge-react";
import copyToClipboard from "@/lib/utils/copyToClipboard";

const EmailSenderSettings = () => {
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [showCommonEmailError, setShowCommonEmailError] = useState(false);
  const [emailSenderLoading, setEmailSenderLoading] = useState(false);
  const [senderVerified, setSenderVerified] = useState(false);
  const [verificationRows, setVerificationRows] = useState(null);
  const [modalError, setModalError] = useState(null);

  const router = useRouter();
  const { shopDetails, refetchShopDetails } = useShopDetails();

  const getVerificationRows = async () => {
    setVerificationRows(null);
    const response = await fetch(`/api/settings/get-verification-rows`);
    if (response.ok) {
      const json = await response.json();
      if (json.success && json.data?.length > 0) {
        setVerificationRows(json.data);
        setModalError(null);
      }
      if (json.error && json.message) {
        setModalError(json.message);
        setVerificationRows([]);
      }
      if (json.success && json.data?.every((row) => row.status)) {
        setSenderVerified(true);
      }
    }
  };

  useEffect(() => {
    getVerificationRows();
  }, []);

  useEffect(() => {
    if (shopDetails) {
      setSenderEmail(shopDetails?.sender_email ?? "");
      setSenderName(shopDetails?.sender_name ?? shopDetails?.name);
      setSenderVerified(shopDetails?.sender_verified ?? false);
    }
  }, [shopDetails]);

  const saveEmailSender = async () => {
    setShowCommonEmailError(false);
    if (isCommonEmailAddress(senderEmail)) {
      setShowCommonEmailError(true);
      return;
    }
    setEmailSenderLoading(true);
    const response = await fetch(`/api/settings/save-email-sender`, {
      method: "POST",
      body: JSON.stringify({
        senderEmail: senderEmail,
        senderName: senderName,
      }),
    });
    if (response.ok) {
      shopify.toast.show("Email sender settings saved successfully");
    } else {
      shopify.toast.show("Failed to save email sender settings");
    }
    await getVerificationRows();
    await refetchShopDetails();
    setEmailSenderLoading(false);
  };

  return (
    <>
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
                onClick={() => {
                  router.push("/settings/email-template");
                }}
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
              <Button
                variant="primary"
                onClick={saveEmailSender}
                loading={emailSenderLoading}
                disabled={shopDetails?.sender_name === senderName && shopDetails?.sender_email === senderEmail}
              >
                Save
              </Button>
            </InlineStack>
            <FormLayout>
              <FormLayout.Group>
                <TextField
                  placeholder={shopDetails?.name}
                  label="Name"
                  value={senderName}
                  onChange={(value) => {
                    setSenderName(value);
                  }}
                />
                <TextField
                  placeholder={"leave blank to use the default email address"}
                  label="Email"
                  value={senderEmail}
                  error={
                    showCommonEmailError
                      ? "Email sender must be a domain you own (not a common email provider)."
                      : senderEmail.endsWith("filejar.com") || senderEmail.endsWith("filejardelivery.com")
                      ? "Please use a domain name you own or leave the email sender blank."
                      : undefined
                  }
                  onChange={(value) => {
                    setSenderEmail(value);
                  }}
                />
              </FormLayout.Group>
            </FormLayout>
            {senderEmail !== process.env.NEXT_PUBLIC_SENDER_EMAIL &&
              senderEmail !== "" &&
              senderVerified === false &&
              shopDetails?.sender_email === senderEmail && (
                <Banner tone="warning">
                  <BlockStack gap="200">
                    <Text variant="bodyMd">
                      You need to <b>verify your domain</b> before you can use this email address as the sender. Emails are sent from{" "}
                      <i>{process.env.NEXT_PUBLIC_SENDER_EMAIL}</i> in the meantime.{" "}
                      <Link
                        target="_blank"
                        url="https://filejar.com/docs/verify-domain"
                      >
                        Read the setup guide
                      </Link>{" "}
                      for more information or{" "}
                      <Link
                        onClick={() => {
                          window.Intercom("showNewMessage", "I need help verifying my domain");
                        }}
                      >
                        contact us
                      </Link>{" "}
                      for assistance.
                    </Text>
                    <Button
                      variant="primary"
                      icon={ShieldCheckMarkIcon}
                      onClick={() => {
                        shopify.modal.show("verify-domain-modal");
                      }}
                    >
                      Verify your domain
                    </Button>
                  </BlockStack>
                </Banner>
              )}
            {senderEmail !== process.env.NEXT_PUBLIC_SENDER_EMAIL && senderEmail !== "" && senderVerified === true && (
              <Banner tone="success">
                <BlockStack gap="200">
                  <Text variant="bodyMd">
                    You&apos;ve successfully verified your domain. Emails are now sent from <i>{senderEmail}</i>.
                  </Text>
                </BlockStack>
              </Banner>
            )}
          </BlockStack>
        </Card>
      </BlockStack>
      <Modal
        id="verify-domain-modal"
        variant="large"
      >
        <TitleBar title="Verify your domain">
          {!senderVerified && (
            <button
              variant="primary"
              onClick={() => {
                getVerificationRows();
              }}
            >
              Verify
            </button>
          )}
          {!senderVerified && (
            <button
              onClick={() => {
                shopify.modal.hide("verify-domain-modal");
              }}
            >
              Cancel
            </button>
          )}
          {senderVerified && (
            <button
              variant="primary"
              onClick={() => {
                shopify.modal.hide("verify-domain-modal");
              }}
            >
              Complete
            </button>
          )}
        </TitleBar>
        <Box padding="400">
          <BlockStack
            gap="400"
            align="center"
            inlineAlign="space-between"
          >
            <Banner tone="info">
              <Text variant="bodyMd">
                You need to add the following DNS records to your domain registrar in order to ensure that emails get delivered and avoid getting marked as
                spam.
                <br />
                To learn more please{" "}
                <Link
                  target="_blank"
                  url="https://filejar.com/docs/verify-domain"
                >
                  read the setup guide
                </Link>{" "}
                or{" "}
                <Link
                  onClick={() => {
                    window.Intercom("showNewMessage", "I need help verifying my domain");
                  }}
                >
                  contact us
                </Link>{" "}
                for assistance.
              </Text>
            </Banner>

            {verificationRows ? (
              <IndexTable
                selectable={false}
                resourceName={{
                  singular: "record",
                  plural: "records",
                }}
                itemCount={verificationRows.length}
                headings={[
                  {
                    title: "Type",
                  },
                  {
                    title: "Name",
                  },
                  {
                    title: "Value",
                  },
                  {
                    title: "Status",
                  },
                ]}
              >
                {verificationRows.map((row, index) => (
                  <IndexTable.Row
                    key={index}
                    id={index}
                  >
                    <IndexTable.Cell>{row.type}</IndexTable.Cell>
                    <IndexTable.Cell>
                      <BlockStack
                        gap="200"
                        inlineAlign="start"
                      >
                        {row.name}
                        <Button
                          icon={ClipboardIcon}
                          onClick={() => {
                            try {
                              copyToClipboard(row.name);
                              shopify.toast.show("Copied to clipboard");
                            } catch (error) {
                              console.error(error);
                              shopify.toast.show("Failed to copy to clipboard");
                            }
                          }}
                        >
                          Copy
                        </Button>
                      </BlockStack>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <BlockStack
                        gap="200"
                        inlineAlign="start"
                      >
                        <div
                          style={{
                            maxWidth: "400px",
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                          }}
                        >
                          {row.value}
                        </div>
                        <Button
                          icon={ClipboardIcon}
                          onClick={() => {
                            try {
                              copyToClipboard(row.value);
                              shopify.toast.show("Copied to clipboard");
                            } catch (error) {
                              console.error(error);
                              shopify.toast.show("Failed to copy to clipboard");
                            }
                          }}
                        >
                          Copy
                        </Button>
                      </BlockStack>
                    </IndexTable.Cell>
                    <IndexTable.Cell>{row.status ? <Badge tone="success">Verified</Badge> : <Badge tone="critical">Not verified</Badge>}</IndexTable.Cell>
                  </IndexTable.Row>
                ))}
              </IndexTable>
            ) : (
              <Spinner size="large" />
            )}
            {modalError && (
              <Banner
                tone="critical"
                title="An error occurred"
              >
                <BlockStack gap="200">
                  <Text variant="bodyMd">{modalError}</Text>
                  <Button
                    variant="primary"
                    onClick={() => {
                      shopify.modal.hide("verify-domain-modal");
                      window.Intercom("showNewMessage", "I need help verifying my domain");
                    }}
                  >
                    I need help
                  </Button>
                </BlockStack>
              </Banner>
            )}
          </BlockStack>
        </Box>
      </Modal>
    </>
  );
};

export default EmailSenderSettings;

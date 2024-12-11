"use client";

import ColorPicker from "@/components/ColorPicker";
import { useShopDetails } from "@/components/ShopDetailsContext";
import { Modal, TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  InlineStack,
  FormLayout,
  TextField,
  Box,
  Badge,
  SkeletonThumbnail,
  SkeletonBodyText,
  SkeletonDisplayText,
  Checkbox,
  DropZone,
  Spinner,
  List,
  Thumbnail,
  Link,
  Button,
  RangeSlider,
} from "@shopify/polaris";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { email_template_defaults, replaceVariables } from "@/constants/emailTemplateDefaults";

const EmailTemplatePage = () => {
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [greeting, setGreeting] = useState("");
  const [body, setBody] = useState("");
  const [productListHeader, setProductListHeader] = useState("");
  const [thankYouText, setThankYouText] = useState("");
  const [thankYouSignature, setThankYouSignature] = useState("");
  const [footer, setFooter] = useState("");
  const [showPoweredBy, setShowPoweredBy] = useState(true);
  const [logo, setLogo] = useState(null);
  const [buttonText, setButtonText] = useState("");
  const [buttonBackgroundColor, setButtonBackgroundColor] = useState("#000");
  const [buttonTextColor, setButtonTextColor] = useState("#fff");
  const [logoLink, setLogoLink] = useState(null);
  const [logoName, setLogoName] = useState(null);
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoSize, setLogoSize] = useState(250);
  const [filesSuffix, setFilesSuffix] = useState("");

  const shopify = useAppBridge();
  const router = useRouter();
  const { shopDetails, refetchShopDetails } = useShopDetails();

  useEffect(() => {
    if (shopDetails) {
      setFromName(shopDetails.settings?.email_template?.from_name ?? shopDetails?.name);
      setFromEmail(shopDetails.settings?.email_template?.from_email ?? shopDetails?.email);
      setSubject(shopDetails.settings?.email_template?.subject ?? email_template_defaults.subject);
      setGreeting(shopDetails.settings?.email_template?.greeting ?? email_template_defaults.greeting);
      setBody(shopDetails.settings?.email_template?.body ?? email_template_defaults.body);
      setProductListHeader(shopDetails.settings?.email_template?.product_list_header ?? email_template_defaults.product_list_header);
      setThankYouText(shopDetails.settings?.email_template?.thank_you_text ?? email_template_defaults.thank_you_text);
      setThankYouSignature(shopDetails.settings?.email_template?.thank_you_signature ?? email_template_defaults.thank_you_signature);
      setFooter(shopDetails.settings?.email_template?.footer ?? email_template_defaults.footer);
      setShowPoweredBy(shopDetails.settings?.email_template?.show_powered_by ?? email_template_defaults.show_powered_by);
      setButtonText(shopDetails.settings?.email_template?.button_text ?? email_template_defaults.button_text);
      setButtonBackgroundColor(shopDetails.settings?.email_template?.button_background_color ?? email_template_defaults.button_background_color);
      setButtonTextColor(shopDetails.settings?.email_template?.button_text_color ?? email_template_defaults.button_text_color);
      setLogoName(shopDetails.settings?.email_template?.logo ?? null);
      setLogoSize(shopDetails.settings?.email_template?.logo_size ?? 250);
      setLogoLink(shopDetails.settings?.email_template?.logo_link ?? null);
      setFilesSuffix(shopDetails.settings?.email_template?.files_suffix ?? email_template_defaults.files_suffix);
    }
  }, [shopDetails]);

  useEffect(() => {
    const runEffect = async () => {
      if (logoName) {
        const res = await fetch("/api/settings/get-logo-url", {
          method: "POST",
          body: JSON.stringify({
            name: logoName,
          }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          setLogoLink(data.url);
        }
      } else {
        setLogoLink(null);
      }
    };

    runEffect();
  }, [logoName]);

  const handleSave = async () => {
    const response = await fetch("/api/settings/save-email-template", {
      method: "POST",
      body: JSON.stringify({
        from_name: fromName,
        from_email: fromEmail,
        subject,
        greeting,
        body,
        product_list_header: productListHeader,
        thank_you_text: thankYouText,
        thank_you_signature: thankYouSignature,
        footer,
        show_powered_by: showPoweredBy,
        button_text: buttonText,
        button_background_color: buttonBackgroundColor,
        button_text_color: buttonTextColor,
        logo: logoName,
        logo_size: logoSize,
        logo_link: logoLink,
        files_suffix: filesSuffix,
      }),
    });
    const data = await response.json();
    if (data.success) {
      shopify.toast.show(data.message);
      router.push("/settings?selection=email");
      await refetchShopDetails();
    } else {
      shopify.toast.show(data.message);
    }
  };

  const renderTextWithLinks = (text) => {
    return <span dangerouslySetInnerHTML={{ __html: replaceVariables(text, shopDetails) }} />;
  };

  const openVariablesModal = () => {
    shopify.modal.show("variables-modal");
  };

  const handleLogoDrop = async (files) => {
    try {
      setLogoLoading(true);

      setLogo(files[0]);

      const formData = new FormData();
      formData.append("logo", files[0]);

      const response = await fetch("/api/settings/upload-logo", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success && data.logo) {
        setLogoName(data.logo);
      } else {
        shopify.toast.show(data.message ?? "Failed to upload logo");
      }
    } catch (error) {
      shopify.toast.show("Failed to upload logo");
    } finally {
      setLogoLoading(false);
    }
  };

  if (!shopDetails) {
    return (
      <Box
        padding="400"
        width="100%"
      >
        <BlockStack
          gap="400"
          align="center"
          inlineAlign="center"
        >
          <Spinner size="large" />
        </BlockStack>
      </Box>
    );
  }

  return (
    <Page
      title="Email Template"
      backAction={{
        content: "Settings",
        url: "/settings?selection=email",
      }}
      primaryAction={{
        content: "Save",
        onAction: handleSave,
      }}
    >
      <Layout>
        <Layout.Section variant="oneThird">
          <BlockStack gap="200">
            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <FormLayout>
                  <TextField
                    label="From name"
                    value={fromName}
                    onChange={(value) => setFromName(value)}
                    autoComplete="off"
                    placeholder={email_template_defaults.from_name}
                  />
                  <TextField
                    label="From email"
                    value={fromEmail}
                    onChange={(value) => setFromEmail(value)}
                    autoComplete="off"
                    placeholder={email_template_defaults.from_email}
                  />
                  <TextField
                    label="Subject"
                    labelAction={{
                      content: "Variables",
                      onAction: openVariablesModal,
                    }}
                    value={subject}
                    onChange={(value) => setSubject(value)}
                    autoComplete="off"
                    placeholder={email_template_defaults.subject}
                  />
                </FormLayout>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack
                gap="200"
                align="center"
                inlineAlign="space-between"
              >
                <DropZone
                  allowMultiple={false}
                  type="image"
                  accept="image/*"
                  disabled={logoLoading}
                  dropOnContent={true}
                  onDropRejected={() => shopify.toast.show("Only images are allowed")}
                  onDropAccepted={handleLogoDrop}
                >
                  {logoLoading && (
                    <Box
                      padding="400"
                      height="100%"
                    >
                      <BlockStack
                        gap="200"
                        align="center"
                        inlineAlign="center"
                      >
                        <Spinner size="large" />
                        <Text
                          as="span"
                          variant="bodyMd"
                        >
                          Uploading logo...
                        </Text>
                      </BlockStack>
                    </Box>
                  )}
                  {!logoLink && !logoLoading && (
                    <DropZone.FileUpload
                      actionTitle="Upload logo"
                      actionHint="or drop an image to upload"
                    />
                  )}
                  {logoLink && !logoLoading && (
                    <Box
                      padding="400"
                      height="100%"
                    >
                      <BlockStack
                        gap="200"
                        align="center"
                        inlineAlign="center"
                      >
                        <Thumbnail
                          size="medium"
                          source={logoLink}
                          alt="logo"
                        />
                        <Button
                          variant="plain"
                          tone="critical"
                          onClick={() => {
                            setLogo(null);
                            setLogoName(null);
                          }}
                        >
                          Remove
                        </Button>
                      </BlockStack>
                    </Box>
                  )}
                </DropZone>
                <RangeSlider
                  label="Logo size"
                  value={logoSize}
                  onChange={(value) => setLogoSize(value)}
                  min={50}
                  max={600}
                  output
                  step={10}
                  suffix={`${logoSize}px`}
                />
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="200">
                <FormLayout>
                  <FormLayout.Group condensed>
                    <ColorPicker
                      label="Button background"
                      color={buttonBackgroundColor}
                      setColor={setButtonBackgroundColor}
                    />
                    <ColorPicker
                      label="Button text color"
                      color={buttonTextColor}
                      setColor={setButtonTextColor}
                    />
                  </FormLayout.Group>
                </FormLayout>
              </BlockStack>
            </Card>
            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <FormLayout>
                  <TextField
                    label="Greeting"
                    labelAction={{
                      content: "Variables",
                      onAction: openVariablesModal,
                    }}
                    value={greeting}
                    onChange={(value) => setGreeting(value)}
                    autoComplete="off"
                    placeholder={email_template_defaults.greeting}
                  />
                  <TextField
                    label="Body"
                    labelAction={{
                      content: "Variables",
                      onAction: openVariablesModal,
                    }}
                    value={body}
                    onChange={(value) => setBody(value)}
                    multiline={6}
                    placeholder={email_template_defaults.body}
                  />
                  <TextField
                    label="Button text"
                    value={buttonText}
                    onChange={(value) => setButtonText(value)}
                    placeholder={email_template_defaults.button_text}
                  />
                  <TextField
                    label="Product list header"
                    value={productListHeader}
                    onChange={(value) => setProductListHeader(value)}
                    placeholder={email_template_defaults.product_list_header}
                  />
                  <TextField
                    label="Files suffix"
                    value={filesSuffix}
                    onChange={(value) => setFilesSuffix(value)}
                    placeholder={email_template_defaults.files_suffix}
                  />
                  <TextField
                    label="Thank you text"
                    value={thankYouText}
                    onChange={(value) => setThankYouText(value)}
                    placeholder={email_template_defaults.thank_you_text}
                  />
                  <TextField
                    label="Thank you signature"
                    value={thankYouSignature}
                    onChange={(value) => setThankYouSignature(value)}
                    placeholder={email_template_defaults.thank_you_signature}
                  />
                  <TextField
                    label="Footer"
                    value={footer}
                    onChange={(value) => setFooter(value)}
                    multiline={3}
                    placeholder={email_template_defaults.footer}
                  />
                  <Checkbox
                    checked={showPoweredBy}
                    onChange={() => setShowPoweredBy(!showPoweredBy)}
                    label={`Show ${process.env.NEXT_PUBLIC_APP_NAME} watermark`}
                  />
                </FormLayout>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
        <Layout.Section>
          <Card roundedAbove="sm">
            <BlockStack
              gap="400"
              inlineAlign="start"
            >
              <Badge tone="info">Preview</Badge>

              <Box
                paddingBlockStart="600"
                paddingBlockEnd="600"
                paddingInline="400"
                width="100%"
              >
                <BlockStack
                  gap="600"
                  align="center"
                  inlineAlign="space-between"
                >
                  <BlockStack gap="100">
                    <Text
                      as="span"
                      variant="bodyLg"
                    >
                      <b>From:</b> {replaceVariables(fromName, shopDetails, {}, false)} &lt;{replaceVariables(fromEmail, shopDetails, {}, false)}&gt;
                    </Text>
                    <Text
                      as="span"
                      variant="bodyLg"
                    >
                      <b>Subject:</b> {replaceVariables(subject, shopDetails, {}, false)}
                    </Text>
                  </BlockStack>

                  <hr />
                  {logoLink && (
                    <InlineStack
                      gap="400"
                      align="center"
                    >
                      <img
                        src={logoLink}
                        alt="logo"
                        width={logoSize}
                      />
                    </InlineStack>
                  )}
                  <InlineStack
                    gap="400"
                    align="space-between"
                    blockAlign="center"
                  >
                    <Text
                      as="span"
                      fontWeight="bold"
                      variant="headingLg"
                    >
                      {replaceVariables(fromName, shopDetails, {}, false)}
                    </Text>
                    <Text
                      as="span"
                      variant="headingLg"
                      fontWeight="bold"
                    >
                      #1234
                    </Text>
                  </InlineStack>
                  <Text
                    as="span"
                    variant="bodyLg"
                  >
                    {replaceVariables(greeting, shopDetails)}
                  </Text>
                  <Text
                    as="span"
                    variant="bodyLg"
                  >
                    {replaceVariables(body, shopDetails)}
                  </Text>
                  <button
                    style={{
                      backgroundColor: buttonBackgroundColor,
                      color: buttonTextColor,
                      padding: "16px 32px",
                      borderRadius: "5px",
                      width: "fit-content",
                      fontSize: "16px",
                      border: "none",
                      fontWeight: "bold",
                      marginTop: "0px",
                      marginInline: "auto",
                      cursor: "pointer",
                    }}
                  >
                    {buttonText}
                  </button>
                  <Text
                    as="span"
                    variant="bodyLg"
                  >
                    {replaceVariables(productListHeader, shopDetails)}
                  </Text>
                  <hr />

                  <InlineStack
                    gap="400"
                    blockAlign="center"
                    align="space-between"
                    wrap={false}
                  >
                    <Box>
                      <SkeletonThumbnail size="medium" />
                    </Box>
                    <Box width="100%">
                      <SkeletonBodyText lines={2} />
                    </Box>
                    <Box width="70px">2 {filesSuffix}</Box>
                  </InlineStack>

                  <hr />
                  <InlineStack
                    gap="400"
                    blockAlign="center"
                    align="space-between"
                    wrap={false}
                  >
                    <Box>
                      <SkeletonThumbnail size="medium" />
                    </Box>
                    <Box width="100%">
                      <SkeletonBodyText lines={2} />
                    </Box>
                    <Box width="70px">1 {filesSuffix}</Box>
                  </InlineStack>

                  <hr />
                  <Box paddingBlockEnd="600">
                    <Text
                      as="span"
                      variant="bodyLg"
                    >
                      {replaceVariables(thankYouText, shopDetails)}
                      <br />
                      {replaceVariables(thankYouSignature, shopDetails)}
                    </Text>
                  </Box>

                  <hr />
                  <Text
                    as="span"
                    variant="bodyLg"
                  >
                    {renderTextWithLinks(footer)}
                  </Text>
                  {showPoweredBy && (
                    <Box paddingBlockStart="1200">
                      <Text
                        as="span"
                        variant="bodySm"
                        alignment="center"
                      >
                        Powered by{" "}
                        <a
                          className="email-link"
                          target="_blank"
                          href="https://filejar.com"
                        >
                          {process.env.NEXT_PUBLIC_APP_NAME}
                        </a>
                      </Text>
                    </Box>
                  )}
                </BlockStack>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
      <Box padding="1200"></Box>
      <Modal id="variables-modal">
        <TitleBar title="Variables">
          <button onClick={() => shopify.modal.hide("variables-modal")}>Close</button>
        </TitleBar>
        <Box padding="400">
          <BlockStack gap="400">
            <Text
              as="p"
              variant="bodyMd"
            >
              Variables are placeholders that will be replaced with actual values when the email is sent. You can use them to personalize the email content.
            </Text>
            <List type="bullet">
              <List.Item>
                <Text
                  as="span"
                  variant="bodyMd"
                >
                  <b>{`{{order_name}}`}</b> - order name (e.g. 1234)
                </Text>
              </List.Item>
              <List.Item>
                <Text
                  as="span"
                  variant="bodyMd"
                >
                  <b>{`{{customer_first_name}}`}</b> - customer&apos;s first name (e.g. Jane)
                </Text>
              </List.Item>
              <List.Item>
                <Text
                  as="span"
                  variant="bodyMd"
                >
                  <b>{`{{customer_last_name}}`}</b> - customer&apos;s last name (e.g. Doe)
                </Text>
              </List.Item>
              <List.Item>
                <Text
                  as="span"
                  variant="bodyMd"
                >
                  <b>{`{{customer_full_name}}`}</b> - customer&apos;s full name (e.g. Jane Doe)
                </Text>
              </List.Item>
              <List.Item>
                <Text
                  as="span"
                  variant="bodyMd"
                >
                  <b>{`{{customer_email}}`}</b> - customer&apos;s email (e.g. jane.doe@example.com)
                </Text>
              </List.Item>
            </List>
          </BlockStack>
        </Box>
      </Modal>
    </Page>
  );
};

export default EmailTemplatePage;

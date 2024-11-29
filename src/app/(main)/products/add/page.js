"use client";

import { Page, Layout, Text, Card, BlockStack, Badge, InlineStack, Button, FormLayout, Checkbox, Box, Banner } from "@shopify/polaris";
import { FileIcon, ProductIcon, UploadIcon } from "@shopify/polaris-icons";
import { useRouter } from "next/navigation";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useState } from "react";
import AddFilesModal from "@/components/AddFilesModal";
import UploadFilesModal from "@/components/UploadFilesModal";
import SelectedFilesList from "@/components/SelectedFilesList";

const ProductAddPage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [autoFulfill, setAutoFulfill] = useState(true);
  const [limitDownloads, setLimitDownloads] = useState(false);
  const [limitDownloadTime, setLimitDownloadTime] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showProductExistsBanner, setShowProductExistsBanner] = useState(false);

  const router = useRouter();
  const shopify = useAppBridge();

  const showToast = (toast) => {
    shopify.toast.show(toast);
  };

  const openAddFilesModal = () => {
    setRefresh(true);
    shopify.modal.show("add-files-modal");
  };

  const openUploadFilesModal = () => {
    shopify.modal.show("upload-files-modal");
  };

  const finishedUploading = (files) => {
    console.log("finished uploading", files);
    setSelectedFiles((previousFiles) => {
      const uniqueFiles = [...new Set([...previousFiles, ...files])];
      return uniqueFiles;
    });
  };

  const showProductSelector = async () => {
    setShowProductExistsBanner(false);

    const selected = await shopify.resourcePicker({
      type: "product",
      filter: {
        archived: false,
        draft: false,
        hidden: false,
      },
    });

    if (selected?.[0]) {
      setSelectedProduct({
        gid: selected[0].id,
        title: selected[0].title,
        image: selected[0].images?.[0]?.originalSrc,
        variants: selected[0].variants?.map((variant) => variant.id),
        totalVariants: selected[0].totalVariants,
        hasOnlyDefaultVariant: selected[0].hasOnlyDefaultVariant,
        details: selected[0],
      });
    }
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/products/save", {
      method: "POST",
      body: JSON.stringify({ autoFulfill, limitDownloads, limitDownloadTime, selectedProduct, selectedFiles, isEdit: false }),
    });
    const { success, code, error } = await res.json();
    if (!success && code === "product_already_exists") {
      setShowProductExistsBanner(true);
    }
    if (success) {
      showToast("Product created successfully");
      router.push("/products");
    }
    setSaving(false);
  };

  return (
    <Page
      title="Add Digital Product"
      backAction={{
        content: "Products",
        onAction: () => {
          router.push("/products");
        },
      }}
      primaryAction={{
        content: "Save",
        onAction: save,
        disabled: !selectedProduct || !selectedFiles.length,
        loading: saving,
      }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <InlineStack
                  gap="200"
                  align="space-between"
                  blockAlign="center"
                >
                  <Text
                    as="h3"
                    variant="bodyLg"
                    fontWeight="bold"
                  >
                    Product
                  </Text>
                  <Button
                    onClick={showProductSelector}
                    variant={selectedProduct ? "secondary" : "primary"}
                    icon={ProductIcon}
                  >
                    {selectedProduct ? "Change Product" : "Select a Product"}
                  </Button>
                </InlineStack>
                {!selectedProduct && (
                  <Text
                    as="p"
                    variant="bodySm"
                  >
                    Select an existing product from your store for which you want to create a digital product.
                  </Text>
                )}
                {showProductExistsBanner && (
                  <Banner
                    tone="critical"
                    title="One or more variants of the product you selected already exists in a digital product."
                    action={{
                      content: "Edit existing digital product",
                      onAction: () => {
                        router.push(`/products/?search=${selectedProduct.gid}`);
                      },
                    }}
                  ></Banner>
                )}
                {selectedProduct && (
                  <InlineStack
                    gap="400"
                    blockAlign="center"
                    align="start"
                    wrap={false}
                  >
                    <img
                      src={selectedProduct.image ?? "/images/no-image.svg"}
                      alt={selectedProduct.title}
                      width={80}
                      height={80}
                      style={{
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                    <BlockStack gap="200">
                      <Text
                        as="h4"
                        variant="bodyLg"
                      >
                        {selectedProduct.title}
                      </Text>
                      {selectedProduct.hasOnlyDefaultVariant ? null : (
                        <Text
                          as="p"
                          variant="bodySm"
                        >
                          {selectedProduct.variants?.length === selectedProduct.totalVariants ? "All" : selectedProduct.variants?.length}{" "}
                          {selectedProduct.variants?.length > 1 || selectedProduct.variants?.length === selectedProduct.totalVariants ? "variants" : "variant"}
                        </Text>
                      )}
                    </BlockStack>
                  </InlineStack>
                )}
              </BlockStack>
            </Card>
            {selectedProduct && (
              <Card roundedAbove="sm">
                <BlockStack gap="200">
                  <InlineStack
                    gap="200"
                    align="space-between"
                    blockAlign="center"
                  >
                    <Text
                      as="h3"
                      variant="bodyLg"
                      fontWeight="bold"
                    >
                      Files
                    </Text>
                    <InlineStack gap="200">
                      <Button
                        variant="secondary"
                        icon={UploadIcon}
                        onClick={openUploadFilesModal}
                      >
                        Upload New Files
                      </Button>
                      <Button
                        variant="primary"
                        icon={FileIcon}
                        onClick={openAddFilesModal}
                      >
                        Add Existing Files
                      </Button>
                    </InlineStack>
                  </InlineStack>
                  {!selectedFiles.length && (
                    <Text
                      as="p"
                      variant="bodySm"
                    >
                      Add one or more files that you want to deliver to customers when they buy this product.
                    </Text>
                  )}
                  {selectedFiles.length > 0 && (
                    <SelectedFilesList
                      names={selectedFiles}
                      setNames={setSelectedFiles}
                    />
                  )}
                </BlockStack>
              </Card>
            )}
          </BlockStack>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            {/* <Card roundedAbove="sm">
              <InlineStack
                gap="200"
                align="space-between"
                blockAlign="center"
              >
                <Badge
                  tone="success"
                  progress="complete"
                >
                  Active
                </Badge>
                <Button icon={ArchiveIcon}>Archive</Button>
              </InlineStack>
            </Card> */}
            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <Text
                  as="h3"
                  variant="bodyLg"
                  fontWeight="bold"
                >
                  Settings
                </Text>
                <FormLayout>
                  <Checkbox
                    label="Auto-fulfill the product"
                    helpText={`Automatically fulfill the product when a customer buys it (you need to also uncheck "This is a physical product" under Shipping settings of the product for this to work).`}
                    checked={autoFulfill}
                    onChange={() => setAutoFulfill(!autoFulfill)}
                  />
                  <Checkbox
                    label="Limit the number of downloads"
                    helpText="Limit the number of times a customer can download each file. This is useful for protecting your files from unauthorized use."
                    checked={limitDownloads}
                    onChange={() => setLimitDownloads(!limitDownloads)}
                  />
                  <Checkbox
                    label="Limit download time"
                    helpText="Limit the amount of time a customer has to download the file. This is useful for protecting your files from unauthorized use."
                    checked={limitDownloadTime}
                    onChange={() => setLimitDownloadTime(!limitDownloadTime)}
                  />
                </FormLayout>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
      <Box padding="400"></Box>
      <AddFilesModal
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        refresh={refresh}
        setRefresh={setRefresh}
      />
      <UploadFilesModal onHide={finishedUploading} />
    </Page>
  );
};

export default ProductAddPage;

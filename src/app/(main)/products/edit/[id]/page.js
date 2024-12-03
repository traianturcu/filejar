"use client";

import { Page, Layout, Text, Card, BlockStack, Badge, InlineStack, Button, FormLayout, Checkbox, Box, Banner } from "@shopify/polaris";
import { FileIcon, ProductIcon, UploadIcon, ArchiveIcon, StatusActiveIcon, DeleteIcon } from "@shopify/polaris-icons";
import { useParams, useRouter } from "next/navigation";
import { Modal, TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { useState, useEffect } from "react";
import AddFilesModal from "@/components/AddFilesModal";
import UploadFilesModal from "@/components/UploadFilesModal";
import SelectedFilesList from "@/components/SelectedFilesList";

const ProductEditPage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [autoFulfill, setAutoFulfill] = useState(true);
  const [limitDownloads, setLimitDownloads] = useState(false);
  const [limitDownloadTime, setLimitDownloadTime] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showProductExistsBanner, setShowProductExistsBanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showError, setShowError] = useState(false);

  const router = useRouter();
  const shopify = useAppBridge();

  const { id } = useParams();

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await fetch(`/api/products/get?id=${id}`);
      const { product } = await res.json();

      if (product) {
        setSelectedProduct({
          gid: product.gid,
          title: product.title,
          image: product.image,
          variants: product.variants,
          totalVariants: product.totalVariants,
          hasOnlyDefaultVariant: product.hasOnlyDefaultVariant,
          details: product.details,
          active: product.active,
        });
        setAutoFulfill(product?.settings?.autoFulfill ?? true);
        setLimitDownloads(product?.settings?.limitDownloads ?? false);
        setLimitDownloadTime(product?.settings?.limitDownloadTime ?? false);
        setSelectedFiles(product?.files ?? []);
      }
    };

    fetchProduct();
  }, [id]);

  const showToast = (toast) => {
    shopify.toast.show(toast);
  };

  const handleArchive = async (id) => {
    setLoading(true);
    const res = await fetch(`/api/products/archive`, {
      method: "POST",
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      setShowError("Error archiving product");
      setLoading(false);
      return;
    }
    const { success } = await res.json();
    if (success) {
      showToast("Product archived successfully");
      setSelectedProduct((previousProduct) => ({
        ...previousProduct,
        active: false,
      }));
    } else {
      setShowError("Error archiving product");
    }
    setLoading(false);
  };

  const handleActivate = async (id) => {
    setLoading(true);
    const res = await fetch(`/api/products/activate`, {
      method: "POST",
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      setShowError("Error activating product");
      setLoading(false);
      return;
    }
    const { success } = await res.json();
    if (success) {
      showToast("Product activated successfully");
      setSelectedProduct((previousProduct) => ({
        ...previousProduct,
        active: true,
      }));
    } else {
      setShowError("Error activating product");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    shopify.modal.show("delete-individual-product-modal");
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    const res = await fetch(`/api/products/delete`, {
      method: "POST",
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      setShowError("Error deleting product");
      shopify.modal.hide("delete-individual-product-modal");
      setLoading(false);
      return;
    }
    const { success } = await res.json();
    if (success) {
      showToast("Product deleted successfully");
      router.push("/products");
    } else {
      setShowError("Error deleting product");
    }
    shopify.modal.hide("delete-individual-product-modal");
    setLoading(false);
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

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/products/save", {
      method: "POST",
      body: JSON.stringify({ autoFulfill, limitDownloads, limitDownloadTime, selectedProduct, selectedFiles, isEdit: true, id }),
    });
    const { success, code, error } = await res.json();
    if (!success && code === "product_already_exists") {
      setShowProductExistsBanner(true);
    }
    if (success) {
      showToast("Product updated successfully");
      router.push("/products");
    }
    setSaving(false);
  };

  return (
    <Page
      title="Edit Digital Product"
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
            {showError && (
              <Banner
                tone="critical"
                title={showError}
                onDismiss={() => setShowError(false)}
                action={{
                  content: "Contact us",
                  icon: ChatIcon,
                  onAction: () => {
                    window.Intercom("showNewMessage", "I'm having an issue with a product");
                  },
                }}
              >
                Please try again or contact us using the button below and we&apos;ll be happy to help.
              </Banner>
            )}
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
            {selectedProduct?.active === true && (
              <Card roundedAbove="sm">
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
                  <Button
                    onClick={() => handleArchive(id)}
                    icon={ArchiveIcon}
                  >
                    Archive
                  </Button>
                </InlineStack>
              </Card>
            )}
            {selectedProduct?.active === false && (
              <Card roundedAbove="sm">
                <InlineStack
                  gap="200"
                  align="space-between"
                  blockAlign="center"
                >
                  <Badge progress="incomplete">Archived</Badge>
                  <InlineStack gap="200">
                    <Button
                      onClick={() => handleActivate(id)}
                      icon={StatusActiveIcon}
                      variant="primary"
                    >
                      Activate
                    </Button>
                    <Button
                      onClick={() => handleDelete(id)}
                      icon={DeleteIcon}
                      tone="critical"
                    />
                  </InlineStack>
                </InlineStack>
              </Card>
            )}
            {selectedProduct && (
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
            )}
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
      <Modal
        id="delete-individual-product-modal"
        variant="small"
      >
        <TitleBar title="Delete Product">
          <button
            variant="primary"
            onClick={handleConfirmDelete}
            tone="critical"
            loading={loading ? "" : undefined}
            disabled={loading ? "" : undefined}
          >
            Delete the product
          </button>
          <button onClick={() => shopify.modal.hide("delete-individual-product-modal")}>Cancel</button>
        </TitleBar>
        <Box padding="200">
          <Text
            as="p"
            variant="bodyMd"
          >
            Are you sure you want to delete this product? This action cannot be undone.
          </Text>
        </Box>
      </Modal>
    </Page>
  );
};

export default ProductEditPage;

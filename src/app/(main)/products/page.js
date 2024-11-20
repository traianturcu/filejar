"use client";

import { useShopDetails } from "@/components/ShopDetailsContext";
import { productsPerPage } from "@/constants/products";
import formatDateTime from "@/lib/utils/formatDateTime";
import useDebounce from "@/lib/utils/useDebounce";
import { Modal, TitleBar } from "@shopify/app-bridge-react";
import {
  Page,
  Layout,
  IndexTable,
  InlineStack,
  Text,
  Badge,
  BlockStack,
  Card,
  Bleed,
  IndexFilters,
  useSetIndexFiltersMode,
  Button,
  Tooltip,
  Banner,
  IndexFiltersMode,
  EmptyState,
  Link,
  Box,
} from "@shopify/polaris";
import { EditIcon, ArchiveIcon, ViewIcon, StatusActiveIcon, DeleteIcon, ChatIcon } from "@shopify/polaris-icons";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const ProductsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);
  const [sortSelected, setSortSelected] = useState(["created_at desc"]);
  const [searchTerm, setSearchTerm] = useState("");
  const { mode, setMode } = useSetIndexFiltersMode();
  const [showError, setShowError] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const { shopDetails } = useShopDetails();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const router = useRouter();

  const fetchProducts = useCallback(async () => {
    if (searchTerm !== debouncedSearchTerm) return;

    setLoading(true);

    const [sortBy, sortOrder] = sortSelected?.[0]?.split(" ");
    const res = await fetch(`/api/products/search?search=${debouncedSearchTerm}&page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
    const { products, count } = await res.json();
    setItems(products);
    setTotalProducts(count);

    setLoading(false);
  }, [debouncedSearchTerm, page, sortSelected, searchTerm]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get("search");
    if (search) {
      setSearchTerm(search);
      setMode(IndexFiltersMode.Filtering);
    }
    setInitialized(true);
  }, [setMode, setSearchTerm]);

  useEffect(() => {
    if (!initialized) return;
    fetchProducts();
  }, [fetchProducts, initialized]);

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
      fetchProducts();
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
      fetchProducts();
    } else {
      setShowError("Error activating product");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setProductToDelete(id);
    shopify.modal.show("delete-product-modal");
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    const res = await fetch(`/api/products/delete`, {
      method: "POST",
      body: JSON.stringify({ id: productToDelete }),
    });
    if (!res.ok) {
      setShowError("Error deleting product");
      shopify.modal.hide("delete-product-modal");
      setLoading(false);
      return;
    }
    const { success } = await res.json();
    if (success) {
      fetchProducts();
    } else {
      setShowError("Error deleting product");
    }
    shopify.modal.hide("delete-product-modal");
    setLoading(false);
  };

  const resourceName = {
    singular: "product",
    plural: "products",
  };

  const sortOptions = [
    { label: "Date", value: "created_at asc", directionLabel: "Ascending" },
    { label: "Date", value: "created_at desc", directionLabel: "Descending" },
    { label: "Name", value: "name asc", directionLabel: "Ascending" },
    { label: "Name", value: "name desc", directionLabel: "Descending" },
  ];

  const rowMarkup = items.map(({ id, title, image, variants, active, files, created_at, totalVariants, hasOnlyDefaultVariant, details }, index) => {
    let nVariants = `${variants?.length || 0} variant${variants?.length > 1 ? "s" : ""}`;
    let variantNames = details?.variants?.map((variant) => variant.title ?? variant.sku ?? variant.displayName ?? variant.id).join(", ");

    if (hasOnlyDefaultVariant) {
      nVariants = "Product without variants";
      variantNames = null;
    }

    if (totalVariants === variants?.length) {
      nVariants = "All variants";
      variantNames = null;
    }

    const nFiles = `${files?.length || 0} file${files?.length > 1 ? "s" : ""}`;

    return (
      <IndexTable.Row
        id={id}
        key={id}
        position={index}
      >
        <IndexTable.Cell>
          <InlineStack
            gap="200"
            align="start"
            blockAlign="center"
            wrap={false}
          >
            <Link
              monochrome
              url={`/products/edit/${id}`}
            >
              <img
                src={image ?? "/images/no-image.svg"}
                alt={title}
                width={75}
                height={75}
                style={{ borderRadius: "5px" }}
              />
            </Link>
            <BlockStack
              gap="100"
              inlineAlign="start"
              align="center"
            >
              <Link
                monochrome
                url={`/products/edit/${id}`}
              >
                <Text
                  variant="bodyMd"
                  fontWeight="bold"
                >
                  {title}
                </Text>
              </Link>
              <Text variant="bodySm">{nVariants}</Text>
              {variantNames && <Text variant="bodyXs">{variantNames}</Text>}
            </BlockStack>
          </InlineStack>
        </IndexTable.Cell>
        <IndexTable.Cell>
          {active ? (
            <Badge
              tone="success"
              progress="complete"
            >
              Active
            </Badge>
          ) : (
            <Badge progress="incomplete">Archived</Badge>
          )}
        </IndexTable.Cell>
        <IndexTable.Cell>{nFiles}</IndexTable.Cell>
        <IndexTable.Cell>{formatDateTime(created_at)}</IndexTable.Cell>
        <IndexTable.Cell>
          <InlineStack
            gap="200"
            wrap={false}
          >
            <Tooltip content="Edit/Manage">
              <Button
                variant="secondary"
                icon={EditIcon}
                size="micro"
                onClick={() => router.push(`/products/${id}`)}
              />
            </Tooltip>
            <Tooltip content="View">
              <Button
                variant="secondary"
                icon={ViewIcon}
                size="micro"
                onClick={() =>
                  open(`https://${shopDetails?.primaryDomain?.host ?? shopDetails?.myshopifyDomain ?? ""}/products/${details?.handle ?? id}`, "_blank")
                }
              />
            </Tooltip>
            {active && (
              <Tooltip content="Archive">
                <Button
                  variant="secondary"
                  icon={ArchiveIcon}
                  size="micro"
                  onClick={() => handleArchive(id)}
                />
              </Tooltip>
            )}
            {!active && (
              <>
                <Tooltip content="Activate">
                  <Button
                    variant="secondary"
                    icon={StatusActiveIcon}
                    size="micro"
                    tone="success"
                    onClick={() => handleActivate(id)}
                  />
                </Tooltip>
                <Tooltip content="Delete">
                  <Button
                    variant="secondary"
                    icon={DeleteIcon}
                    size="micro"
                    tone="critical"
                    onClick={() => handleDelete(id)}
                  />
                </Tooltip>
              </>
            )}
          </InlineStack>
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  const emptyStateMarkup = (
    <EmptyState
      heading="You haven't created any products yet"
      action={{
        content: "Add Digital Product",
        onAction: () => {
          router.push("/products/add");
        },
      }}
      image="/images/empty.svg"
      imageContained={true}
    >
      <Text
        as="p"
        variant="bodyLg"
      >
        Get started by adding your first digital product.
      </Text>
    </EmptyState>
  );

  return (
    <Page
      title="Products"
      primaryAction={{
        content: "Add Digital Product",
        onAction: () => {
          router.push("/products/add");
        },
      }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="200">
            {showError && (
              <Banner
                tone="critical"
                title={showError}
                onDismiss={() => setShowError(false)}
                action={{
                  content: "Contact us",
                  icon: ChatIcon,
                  onAction: () => {
                    window.Intercom("showNewMessage", "I'm having an issue archiving a product");
                  },
                }}
              >
                Please try again or contact us using the button below and we'll be happy to help.
              </Banner>
            )}
            <Card roundedAbove="sm">
              <Bleed
                marginInline="400"
                marginBlock="400"
              >
                <IndexFilters
                  queryValue={searchTerm}
                  queryPlaceholder="Search products"
                  onQueryChange={setSearchTerm}
                  onQueryClear={() => setSearchTerm("")}
                  onClearAll={() => setSearchTerm("")}
                  tabs={[]}
                  mode={mode}
                  setMode={setMode}
                  onModeChange={setMode}
                  sortOptions={sortOptions}
                  sortSelected={sortSelected}
                  onSort={setSortSelected}
                  canCreateNewView={false}
                  filters={[]}
                  appliedFilters={[]}
                  hideFilters={true}
                  filteringAccessibilityLabel="Search (F)"
                  cancelAction={{
                    onAction: () => setSearchTerm(""),
                    disabled: false,
                    loading: false,
                  }}
                  autoFocusSearchField={true}
                />
                <IndexTable
                  selectable={false}
                  resourceName={resourceName}
                  itemCount={totalProducts >= page * productsPerPage ? productsPerPage : totalProducts % productsPerPage}
                  headings={[{ title: "Product" }, { title: "Status" }, { title: "Files" }, { title: "Created" }, { title: "Actions" }]}
                  emptyState={emptyStateMarkup}
                  loading={loading}
                  pagination={{
                    hasNext: totalProducts > page * productsPerPage,
                    hasPrevious: page > 1,
                    onNext: () => setPage((prevPage) => prevPage + 1),
                    onPrevious: () => setPage((prevPage) => prevPage - 1),
                  }}
                >
                  {rowMarkup}
                </IndexTable>
              </Bleed>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
      <Modal
        id="delete-product-modal"
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
          <button onClick={() => shopify.modal.hide("delete-product-modal")}>Cancel</button>
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

export default ProductsPage;

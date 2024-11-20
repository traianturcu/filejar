"use client";

import { Banner, BlockStack, Box, Button, Card, EmptyState, Filters, InlineStack, ResourceItem, ResourceList, Text } from "@shopify/polaris";
import { useEffect, useState } from "react";
import useDebounce from "@/lib/utils/useDebounce";
import { filesPerPage } from "@/constants/files";
import { useAppBridge, Modal, TitleBar } from "@shopify/app-bridge-react";
import formatDateTime from "@/lib/utils/formatDateTime";
import formatFileSize from "@/lib/utils/formatFileSize";

const FilesList = ({ showUploadModal, refresh, setRefresh }) => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [page, setPage] = useState(1);
  const [sortValue, setSortValue] = useState("created_at-desc");
  const [showError, setShowError] = useState(false);
  const [errorContent, setErrorContent] = useState("");
  const shopify = useAppBridge();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);

      const [sortBy, sortOrder] = sortValue.split("-");
      const res = await fetch(`/api/files/search?search=${debouncedSearchTerm}&page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
      const { files, count } = await res.json();
      setItems(files);
      setTotalFiles(count);

      setLoading(false);
    };

    fetchFiles();
  }, [debouncedSearchTerm, page, sortValue, refresh]);

  useEffect(() => {
    if (refresh) {
      setPage(1);
      setSearchTerm("");
      setSelectedItems([]);
      setSortValue("created_at-desc");
      setRefresh(false);
    }
  }, [setRefresh, refresh]);

  const deleteFiles = async () => {
    setLoading(true);
    hideDeleteConfirmationModal();
    const ids = selectedItems.map((id) => id);
    const res = await fetch("/api/files/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids }),
    });
    const { success } = await res.json();

    if (success) {
      shopify.toast.show("Files deleted", {
        duration: 5000,
      });
      setRefresh(true);
    } else {
      setShowError(true);
      setErrorContent("The files could not be deleted. Please try again or contact support using the button below if you keep encountering this issue.");
    }
    setLoading(false);
  };

  const showDeleteConfirmationModal = () => {
    shopify.modal.show("confirm-delete-modal");
  };

  const hideDeleteConfirmationModal = () => {
    shopify.modal.hide("confirm-delete-modal");
  };

  const emptyStateMarkup = (
    <EmptyState
      heading="Upload a file to get started"
      action={{
        content: "Upload files",
        onAction: showUploadModal,
      }}
      image="/images/empty.svg"
    >
      <Text
        as="p"
        variant="bodyLg"
      >
        Upload the files you want to sell in your store. Once uploaded, you can connect them to your products.
      </Text>
    </EmptyState>
  );

  return (
    <BlockStack gap="300">
      {showError && (
        <Banner
          title="Something went wrong"
          tone="critical"
          hideIcon={true}
          onDismiss={() => setShowError(false)}
        >
          <BlockStack
            gap="200"
            inlineAlign="start"
          >
            <Text
              as="p"
              variant="bodyLg"
            >
              {errorContent ?? "An error occurred. Please try again."}
            </Text>
            <Button onClick={() => window?.Intercom("showNewMessage", "I encountered an error - I couldn't delete my files.")}>Contact Support</Button>
          </BlockStack>
        </Banner>
      )}

      <Card roundedAbove="sm">
        <ResourceList
          items={items}
          emptyState={emptyStateMarkup}
          filterControl={
            <Filters
              queryValue={searchTerm}
              onQueryChange={setSearchTerm}
              onQueryClear={() => setSearchTerm("")}
              onClearAll={() => setSearchTerm("")}
              filters={[]}
              appliedFilters={[]}
            />
          }
          sortOptions={[
            { label: "Latest", value: "created_at-desc" },
            { label: "Oldest", value: "created_at-asc" },
            { label: "Name A-Z", value: "name-asc" },
            { label: "Name Z-A", value: "name-desc" },
            { label: "Large to Small", value: "size-desc" },
            { label: "Small to Large", value: "size-asc" },
          ]}
          sortValue={sortValue}
          onSortChange={setSortValue}
          renderItem={(item) => {
            const { name, originalFileName, size, created_at, mimetype } = item;

            return (
              <ResourceItem
                id={name}
                key={name}
              >
                <InlineStack
                  gap="200"
                  align="space-between"
                  blockAlign="center"
                  wrap={false}
                >
                  <BlockStack
                    gap="200"
                    align="center"
                    inlineAlign="start"
                  >
                    <Text
                      as="span"
                      variant="bodyLg"
                      fontWeight="bold"
                    >
                      {originalFileName}
                    </Text>
                    <Text
                      as="span"
                      variant="bodySm"
                    >
                      {mimetype}
                    </Text>
                  </BlockStack>
                  <InlineStack
                    gap="400"
                    align="center"
                    wrap={false}
                  >
                    <Text
                      as="span"
                      variant="bodySm"
                    >
                      {formatFileSize(size)}
                    </Text>
                    <Text
                      as="span"
                      variant="bodySm"
                    >
                      {formatDateTime(created_at)}
                    </Text>
                  </InlineStack>
                </InlineStack>
              </ResourceItem>
            );
          }}
          resourceName={{ singular: "file", plural: "files" }}
          loading={loading}
          bulkActions={[
            {
              content: "Delete",
              onAction: showDeleteConfirmationModal,
              destructive: true,
            },
          ]}
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          resolveItemId={(item) => item.name}
          idForItem={(item) => item.name}
          totalItemsCount={totalFiles}
          pagination={
            items?.length
              ? {
                  hasPrevious: page > 1,
                  hasNext: totalFiles > page * filesPerPage,
                  onNext: () => setPage((prevPage) => prevPage + 1),
                  onPrevious: () => setPage((prevPage) => prevPage - 1),
                  label: `${page} of ${Math.ceil(totalFiles / filesPerPage)}`,
                }
              : null
          }
        />
      </Card>
      <Modal id="confirm-delete-modal">
        <TitleBar title="Delete Files">
          <button onClick={hideDeleteConfirmationModal}>Cancel</button>
          <button
            variant="primary"
            onClick={deleteFiles}
            loading={loading ? "" : undefined}
            disabled={loading ? "" : undefined}
          >
            Delete
          </button>
        </TitleBar>
        <Box padding="400">
          <Text as="p">Are you sure you want to delete the selected files? This is irreversible.</Text>
        </Box>
      </Modal>
    </BlockStack>
  );
};

export default FilesList;

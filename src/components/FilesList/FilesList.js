"use client";

import {
  Banner,
  Bleed,
  BlockStack,
  Box,
  Button,
  Card,
  EmptyState,
  Filters,
  IndexFilters,
  IndexTable,
  InlineStack,
  ResourceItem,
  ResourceList,
  Text,
  useIndexResourceState,
  useSetIndexFiltersMode,
} from "@shopify/polaris";
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
  const [totalFiles, setTotalFiles] = useState(0);
  const [page, setPage] = useState(1);
  const [showError, setShowError] = useState(false);
  const [errorContent, setErrorContent] = useState("");
  const shopify = useAppBridge();
  const { mode, setMode } = useSetIndexFiltersMode();
  const [sortSelected, setSortSelected] = useState(["created_at desc"]);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const sortOptions = [
    { label: "Date", value: "created_at asc", directionLabel: "Ascending" },
    { label: "Date", value: "created_at desc", directionLabel: "Descending" },
    { label: "Name", value: "name asc", directionLabel: "Ascending" },
    { label: "Name", value: "name desc", directionLabel: "Descending" },
    { label: "Size", value: "size asc", directionLabel: "Ascending" },
    { label: "Size", value: "size desc", directionLabel: "Descending" },
  ];

  const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(items);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);

      const [sortBy, sortOrder] = sortSelected?.[0]?.split(" ");
      const res = await fetch(`/api/files/search?search=${debouncedSearchTerm}&page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}`, { cache: "no-store" });
      const { files, count } = await res.json();
      setItems(files.map((file) => ({ ...file, id: file.name })));
      setTotalFiles(count);

      setLoading(false);
    };

    fetchFiles();
  }, [debouncedSearchTerm, page, sortSelected, refresh]);

  useEffect(() => {
    if (refresh) {
      setPage(1);
      setSearchTerm("");
      setSortSelected(["created_at desc"]);
      setRefresh(false);
      handleSelectionChange([]);
    }
  }, [setRefresh, refresh, handleSelectionChange]);

  const deleteFiles = async () => {
    setLoading(true);
    hideDeleteConfirmationModal();
    const ids = selectedResources.map((id) => id);
    console.log({ ids });
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
        <Bleed
          marginInline="400"
          marginBlock="400"
        >
          <IndexFilters
            queryValue={searchTerm}
            queryPlaceholder="Search files"
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
          />
          <IndexTable
            resourceName={{ singular: "file", plural: "files" }}
            itemCount={items.length}
            onSelectionChange={handleSelectionChange}
            headings={[{ title: "File" }, { title: "Size" }, { title: "Date" }]}
            loading={loading}
            emptyState={emptyStateMarkup}
            pagination={{
              hasNext: totalFiles > page * filesPerPage,
              hasPrevious: page > 1,
              onNext: () => setPage((prevPage) => prevPage + 1),
              onPrevious: () => setPage((prevPage) => prevPage - 1),
              label: `${page} of ${Math.ceil(totalFiles / filesPerPage)}`,
            }}
            selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
            bulkActions={[
              {
                content: "Delete",
                onAction: showDeleteConfirmationModal,
              },
            ]}
          >
            {items.map(({ id, originalFileName, size, created_at, mimetype }, index) => (
              <IndexTable.Row
                id={id}
                key={id}
                selected={selectedResources.includes(id)}
                position={index}
              >
                <IndexTable.Cell>
                  <BlockStack gap="50">
                    <Text
                      variant="bodyMd"
                      fontWeight="bold"
                    >
                      {originalFileName}
                    </Text>
                    <Text variant="bodySm">{mimetype}</Text>
                  </BlockStack>
                </IndexTable.Cell>
                <IndexTable.Cell>{formatFileSize(size)}</IndexTable.Cell>
                <IndexTable.Cell>{formatDateTime(created_at)}</IndexTable.Cell>
              </IndexTable.Row>
            ))}
          </IndexTable>
        </Bleed>
      </Card>
      <Modal id="confirm-delete-modal">
        <TitleBar title="Delete Files">
          <button onClick={hideDeleteConfirmationModal}>Cancel</button>
          <button
            variant="primary"
            onClick={deleteFiles}
            loading={loading ? "" : undefined}
            disabled={loading ? "" : undefined}
            tone="critical"
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

"use client";

import { BlockStack, Card, EmptyState, IndexFilters, IndexTable, Text, useIndexResourceState, useSetIndexFiltersMode } from "@shopify/polaris";
import { useState, useEffect } from "react";
import useDebounce from "@/lib/utils/useDebounce";
import { filesPerPage } from "@/constants/files";
import formatDateTime from "@/lib/utils/formatDateTime";
import formatFileSize from "@/lib/utils/formatFileSize";

const FilesTable = ({ refresh, setRefresh, showUploadModal, selectedFiles, setSelectedFiles }) => {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalFiles, setTotalFiles] = useState(0);
  const [sortSelected, setSortSelected] = useState(["created_at desc"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState([]);
  const { mode, setMode } = useSetIndexFiltersMode();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { selectedResources, allResourcesSelected, handleSelectionChange, clearSelection } = useIndexResourceState(items, {
    selectedResources: selectedFiles,
  });

  useEffect(() => {
    if (selectedFiles) {
      handleSelectionChange(selectedFiles);
    }
  }, [selectedFiles, handleSelectionChange]);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);

      const [sortBy, sortOrder] = sortSelected?.[0]?.split(" ");
      const res = await fetch(`/api/files/search?search=${debouncedSearchTerm}&page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
      const { files, count } = await res.json();
      const remappedFiles = files.map((file) => {
        return {
          ...file,
          id: file.name,
        };
      });
      setItems(remappedFiles);
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
      clearSelection();
      if (selectedFiles?.length) {
        selectedFiles.forEach((file) => {
          handleSelectionChange("single", true, file);
        });
      }
      setRefresh(false);
    }
  }, [setRefresh, refresh]);

  useEffect(() => {
    setSelectedFiles(selectedResources);
  }, [selectedResources, setSelectedFiles]);

  const resourceName = {
    singular: "file",
    plural: "files",
  };

  const sortOptions = [
    { label: "Date", value: "created_at asc", directionLabel: "Ascending" },
    { label: "Date", value: "created_at desc", directionLabel: "Descending" },
    { label: "Name", value: "name asc", directionLabel: "Ascending" },
    { label: "Name", value: "name desc", directionLabel: "Descending" },
    { label: "Size", value: "size asc", directionLabel: "Ascending" },
    { label: "Size", value: "size desc", directionLabel: "Descending" },
  ];

  const emptyStateMarkup = (
    <EmptyState
      heading="Upload a file to get started"
      action={{
        content: "Upload files",
        onAction: showUploadModal,
      }}
      image="/images/empty.svg"
    ></EmptyState>
  );

  const rowMarkup = items.map(({ id, name, originalFileName, size, created_at, mimetype }, index) => {
    return (
      <IndexTable.Row
        id={id}
        key={id}
        position={index}
        selected={selectedResources.includes(id)}
      >
        <IndexTable.Cell>
          <BlockStack gap="200">
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
    );
  });

  return (
    <>
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
        resourceName={resourceName}
        itemCount={totalFiles > page * filesPerPage ? filesPerPage : totalFiles % filesPerPage}
        headings={[{ title: "File" }, { title: "Size" }, { title: "Upload Date" }]}
        emptyState={emptyStateMarkup}
        loading={loading}
        pagination={{
          hasNext: totalFiles > page * filesPerPage,
          hasPrevious: page > 1,
          onNext: () => setPage((prevPage) => prevPage + 1),
          onPrevious: () => setPage((prevPage) => prevPage - 1),
        }}
        onSelectionChange={handleSelectionChange}
        selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
      >
        {rowMarkup}
      </IndexTable>
    </>
  );
};

export default FilesTable;

"use client";

import { ResourceItem, ResourceList, Text, InlineStack, BlockStack, Button } from "@shopify/polaris";
import { DeleteIcon } from "@shopify/polaris-icons";
import { useState, useEffect } from "react";
import formatFileSize from "@/lib/utils/formatFileSize";
import formatDateTime from "@/lib/utils/formatDateTime";

const SelectedFilesList = ({ names, setNames }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);

      const res = await fetch("/api/files/searchByName", {
        method: "POST",
        body: JSON.stringify({ names }),
      });
      const { files } = await res.json();
      setSelectedFiles(files);

      setLoading(false);
    };

    fetchFiles();
  }, [names]);

  const resourceName = {
    singular: "file",
    plural: "files",
  };

  return (
    <ResourceList
      loading={loading}
      items={selectedFiles}
      resourceName={resourceName}
      renderItem={(file) => {
        return (
          <ResourceItem id={file.name}>
            <InlineStack
              gap="200"
              align="space-between"
              blockAlign="center"
              wrap={false}
            >
              <BlockStack gap="200">
                <Text
                  as="p"
                  variant="bodyLg"
                  fontWeight="medium"
                >
                  {file.originalFileName}
                </Text>
                <Text
                  as="p"
                  variant="bodySm"
                >
                  {`${file.mimetype}, ${formatFileSize(file.size)}`}
                </Text>
                <Text
                  as="p"
                  variant="bodySm"
                >
                  {`${formatDateTime(file.created_at)}`}
                </Text>
              </BlockStack>
              <InlineStack gap="200">
                <Button
                  icon={DeleteIcon}
                  tone="critical"
                  onClick={() => {
                    setNames((previousNames) => {
                      const newNames = previousNames.filter((name) => name !== file.name);
                      return newNames;
                    });
                  }}
                />
              </InlineStack>
            </InlineStack>
          </ResourceItem>
        );
      }}
    />
  );
};

export default SelectedFilesList;

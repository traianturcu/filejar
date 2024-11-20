"use client";

import { Box, Layout, Page } from "@shopify/polaris";
import FilesList from "@/components/FilesList";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useState } from "react";
import UploadFilesModal from "@/components/UploadFilesModal";

const FilesPage = () => {
  const [refresh, setRefresh] = useState(false);
  const shopify = useAppBridge();

  const showUploadModal = () => {
    shopify.modal.show("upload-files-modal");
  };

  const finishedUploading = () => {
    setRefresh(true);
  };

  return (
    <Page
      title="Files"
      primaryAction={{
        content: "Add files",
        onAction: () => showUploadModal(),
      }}
    >
      <Layout>
        <Layout.Section>
          <FilesList
            showUploadModal={showUploadModal}
            refresh={refresh}
            setRefresh={setRefresh}
          />
          <Box padding="1000" />
        </Layout.Section>
      </Layout>
      <UploadFilesModal onHide={finishedUploading} />
    </Page>
  );
};

export default FilesPage;

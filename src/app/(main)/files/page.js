"use client";

import { Box, Layout, Page } from "@shopify/polaris";
import { Dashboard } from "@uppy/react";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import FilesList from "@/components/FilesList";
import { useUppyWithSupabase } from "@/lib/client/uppy";
import { Modal, TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { useState } from "react";

const FilesPage = () => {
  const [refresh, setRefresh] = useState(false);
  const shopify = useAppBridge();

  const onError = (error) => {
    console.error({ error });
  };

  const onComplete = (result) => {
    console.log({ result });
  };

  const uppy = useUppyWithSupabase({ bucketName: "uploads", onError, onComplete });

  const showUploadModal = () => {
    shopify.modal.show("upload-files-modal");
  };

  const hideUploadModal = () => {
    shopify.modal.hide("upload-files-modal");
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
      <Modal
        id="upload-files-modal"
        onHide={finishedUploading}
      >
        <TitleBar title="Add Files">
          <button onClick={hideUploadModal}>I&apos;m done uploading</button>
        </TitleBar>
        <Dashboard
          uppy={uppy}
          showProgressDetails={true}
          doneButtonHandler={null}
        />
      </Modal>
    </Page>
  );
};

export default FilesPage;

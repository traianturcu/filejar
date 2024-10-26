"use client";

import { BlockStack, Button, Card, FormLayout, Layout, Page, Text, TextField } from "@shopify/polaris";
import { useRouter } from "next/navigation";
import { useState } from "react";

const WelcomePage = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const updateImportantEmail = async () => {
    if (!email) {
      setEmailError("Please provide an email address for important account notifications.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const isValid = emailRegex.test(email);

    if (!isValid) {
      setEmailError("Please enter a valid email address.");
      return;
    } else {
      setEmailError(null);
    }

    setSaving(true);

    const res = await fetch("/api/update-important-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    const { success, message } = await res.json();

    if (!success) {
      setEmailError(message);
      setSaving(false);
      return;
    } else {
      router.push("/");
      return;
    }
  };

  return (
    <Page narrowWidth>
      <Layout>
        <Layout.Section>
          <Card roundedAbove="sm">
            <BlockStack
              gap="500"
              inlineAlign="center"
            >
              <iframe
                width="560"
                height="315"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=cEALYfNsvRx409M1"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
              <Text
                as="h2"
                variant="headingMd"
              >
                Thank you for installing {process.env.NEXT_PUBLIC_APP_NAME}!
              </Text>
              <Text
                as="p"
                variant="bodyMd"
                alignment="center"
              >
                Please watch the short video above to learn how to get started. Then please enter the email address you&apos;d like to use for important account
                notifications.
              </Text>
              <FormLayout>
                <TextField
                  label="Best email address"
                  placeholder="important@email.com"
                  type="email"
                  autoComplete="off"
                  onChange={(v) => setEmail(v)}
                  value={email}
                  error={emailError}
                />
                <Button
                  size="large"
                  variant="primary"
                  onClick={updateImportantEmail}
                  disabled={!email || saving}
                  loading={saving}
                  fullWidth
                >
                  Get Started
                </Button>
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default WelcomePage;

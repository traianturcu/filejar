"use client";

import { useState, useEffect } from "react";
import {
  Badge,
  BlockStack,
  Button,
  Card,
  EmptyState,
  IndexFilters,
  IndexTable,
  InlineStack,
  Link,
  Text,
  Tooltip,
  useSetIndexFiltersMode,
} from "@shopify/polaris";
import { ExternalSmallIcon, ViewIcon } from "@shopify/polaris-icons";
import useDebounce from "@/lib/utils/useDebounce";
import { ordersPerPage } from "@/constants/orders";

const OrdersList = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [page, setPage] = useState(1);
  const [sortSelected, setSortSelected] = useState(["created_at desc"]);
  const { mode, setMode } = useSetIndexFiltersMode();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);

      const [sortBy, sortOrder] = sortSelected?.[0]?.split(" ");
      const res = await fetch(`/api/orders/search?search=${debouncedSearchTerm}&page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}`, { cache: "no-store" });
      const { orders, count } = await res.json();
      setItems(orders);
      setTotalOrders(count);

      setLoading(false);
    };

    fetchOrders();
  }, [debouncedSearchTerm, page, sortSelected]);

  const emptyStateMarkup = (
    <EmptyState
      heading="No orders yet"
      image="/images/empty.svg"
    >
      <Text
        as="p"
        variant="bodyLg"
      >
        Orders will appear here when customers purchase your digital products.
      </Text>
    </EmptyState>
  );

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const resourceName = {
    singular: "order",
    plural: "orders",
  };

  const fulfillment_badges = {
    fulfilled: {
      progress: "complete",
      tone: "success",
    },
    restocked: {
      progress: "complete",
      tone: "critical",
    },
    partial: {
      progress: "partiallyComplete",
      tone: "warning",
    },
    default: {
      progress: "incomplete",
      tone: "attention",
    },
  };

  const fulfillment_badge_labels = {
    fulfilled: "Fulfilled",
    restocked: "Restocked",
    partial: "Partially Fulfilled",
    default: "Unfulfilled",
  };

  const payment_badges = {
    pending: {
      progress: "incomplete",
      tone: "attention",
    },
    authorized: {
      progress: "complete",
      tone: "success",
    },
    partially_paid: {
      progress: "partiallyComplete",
      tone: "warning",
    },
    paid: {
      progress: "complete",
      tone: "success",
    },
    partially_refunded: {
      progress: "partiallyComplete",
      tone: "critical",
    },
    refunded: {
      progress: "complete",
      tone: "critical",
    },
    voided: {
      progress: "complete",
      tone: "critical",
    },
    default: {
      progress: "incomplete",
      tone: "attention",
    },
  };

  const payment_badge_labels = {
    pending: "Pending",
    authorized: "Authorized",
    partially_paid: "Partially Paid",
    paid: "Paid",
    partially_refunded: "Partially Refunded",
    refunded: "Refunded",
    voided: "Voided",
    default: "Unpaid",
  };

  const sortOptions = [
    { label: "Date", value: "created_at asc", directionLabel: "Ascending" },
    { label: "Date", value: "created_at desc", directionLabel: "Descending" },
    { label: "Total", value: "total asc", directionLabel: "Ascending" },
    { label: "Total", value: "total desc", directionLabel: "Descending" },
  ];

  const rowMarkup = items?.map(
    (
      {
        order_id,
        order_name,
        customer_first_name,
        customer_last_name,
        customer_email,
        created_at,
        fulfillment_status,
        payment_status,
        total,
        currency,
        cancelled_at,
        fraud_risk,
      },
      index
    ) => (
      <IndexTable.Row
        id={order_name}
        key={order_name}
        position={index}
      >
        <IndexTable.Cell>
          <BlockStack gap="200">
            <Link
              monochrome
              onClick={() => {}}
            >
              <Text
                variant="bodyMd"
                fontWeight="bold"
              >
                #{order_name}
              </Text>
            </Link>
            <InlineStack gap="200">
              {cancelled_at ? (
                <Badge
                  size="small"
                  tone="warning"
                >
                  Cancelled
                </Badge>
              ) : (
                <>
                  <Badge
                    size="small"
                    progress={fulfillment_badges[fulfillment_status]?.progress ?? fulfillment_badges.default.progress}
                    tone={fulfillment_badges[fulfillment_status]?.tone ?? fulfillment_badges.default.tone}
                  >
                    {fulfillment_badge_labels[fulfillment_status] ?? fulfillment_badge_labels.default}
                  </Badge>
                  <Badge
                    size="small"
                    progress={payment_badges[payment_status]?.progress ?? payment_badges.default.progress}
                    tone={payment_badges[payment_status]?.tone ?? payment_badges.default.tone}
                  >
                    {payment_badge_labels[payment_status] ?? payment_badge_labels.default}
                  </Badge>
                </>
              )}
              {fraud_risk === "high" && (
                <Badge
                  size="small"
                  tone="critical"
                >
                  High Risk
                </Badge>
              )}
              {fraud_risk === "medium" && (
                <Badge
                  size="small"
                  tone="warning"
                >
                  Medium Risk
                </Badge>
              )}
              {fraud_risk === "low" && (
                <Badge
                  size="small"
                  tone="success"
                >
                  Low Risk
                </Badge>
              )}
            </InlineStack>
          </BlockStack>
        </IndexTable.Cell>
        <IndexTable.Cell>{`${customer_first_name} ${customer_last_name}`}</IndexTable.Cell>
        <IndexTable.Cell>{customer_email}</IndexTable.Cell>
        <IndexTable.Cell>{formatDateTime(created_at)}</IndexTable.Cell>
        <IndexTable.Cell>{`${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`}</IndexTable.Cell>
        <IndexTable.Cell>
          <InlineStack
            gap="200"
            wrap={false}
          >
            <Tooltip content="Manage order">
              <Button
                variant="primary"
                icon={ViewIcon}
                onClick={() => {}}
              />
            </Tooltip>
            <Tooltip content="View order in Shopify">
              <Button
                icon={ExternalSmallIcon}
                onClick={() => {
                  open(`shopify://admin/orders/${order_id}`, "_blank");
                }}
              />
            </Tooltip>
          </InlineStack>
        </IndexTable.Cell>
      </IndexTable.Row>
    )
  );

  return (
    <Card roundedAbove="sm">
      <IndexFilters
        queryValue={searchTerm}
        queryPlaceholder="Search orders"
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
        selectable={false}
        resourceName={resourceName}
        itemCount={totalOrders}
        headings={[{ title: "Order" }, { title: "Customer" }, { title: "Email" }, { title: "Date" }, { title: "Total" }, { title: "Actions" }]}
        emptyState={emptyStateMarkup}
        loading={loading}
        pagination={{
          hasNext: totalOrders > page * ordersPerPage,
          hasPrevious: page > 1,
          onNext: () => setPage((prevPage) => prevPage + 1),
          onPrevious: () => setPage((prevPage) => prevPage - 1),
          label: `${page} of ${Math.ceil(totalOrders / ordersPerPage)}`,
        }}
      >
        {rowMarkup}
      </IndexTable>
    </Card>
  );
};

export default OrdersList;

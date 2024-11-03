export const handleCustomerDataRequest = async (shop, body) => {
  console.log({
    message: "[COMPLIANCE WEBHOOK] Received customer data request",
    shop,
    body,
  });
};

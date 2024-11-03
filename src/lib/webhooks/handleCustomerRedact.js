export const handleCustomerRedact = async (shop, body) => {
  console.log({
    message: "[COMPLIANCE WEBHOOK] Received customer redact",
    shop,
    body,
  });
};

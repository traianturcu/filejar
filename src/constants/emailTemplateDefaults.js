export const email_template_defaults = {
  from_name: `{{shop_name}}`,
  from_email: `{{shop_email}}`,
  subject: `Download your content for order #{{order_name}}`,
  button_text: "Download Content",
  greeting: `Hello {{customer_first_name}},`,
  body: `Thank you for purchasing from {{shop_name}}! You can download your content for order #{{order_name}} using the button below.`,
  product_list_header: "Your order includes the following products:",
  thank_you_text: "Thank you,",
  thank_you_signature: `{{shop_name}} Team`,
  footer: `If you have any questions, please contact us at {{shop_email}}`,
  show_powered_by: true,
  button_background_color: "#007bff",
  button_text_color: "#ffffff",
  files_suffix: "file(s)",
};

export const replaceVariables = (text, shopDetails, order = {}, includeHTML = true) => {
  if (!text) return "";

  const variables = [
    {
      variable: "order_name",
      value: order?.order_name ?? "1234",
    },
    {
      variable: "customer_first_name",
      value: order?.customer_first_name ?? "Jane",
    },
    {
      variable: "customer_last_name",
      value: order?.customer_last_name ?? "Doe",
    },
    {
      variable: "customer_full_name",
      value: order?.customer_first_name || order?.customer_last_name ? `${order?.customer_first_name ?? ""} ${order?.customer_last_name ?? ""}` : "Jane Doe",
    },
    {
      variable: "customer_email",
      value: order?.customer_email ?? "jane.doe@example.com",
    },
    {
      variable: "shop_name",
      value: shopDetails?.name ?? "",
    },
    {
      variable: "shop_email",
      value: shopDetails?.email ?? "",
    },
  ];

  variables.forEach((variable) => {
    const regex = new RegExp(`{{\\s*${variable.variable}\\s*}}`, "g");
    text = text.replace(regex, variable.value);
  });

  //add email links for all emails
  if (includeHTML) {
    const email_regex = /\w+@\w+\.\w+/g;
    text = text.replace(email_regex, (email) => `<a class="email-link" href="mailto:${email}">${email}</a>`);
  }

  return text;
};

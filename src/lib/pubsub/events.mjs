export const events = [
  {
    name: "UNINSTALL_APP",
    subscribers: [
      {
        handler: "api/subscriber/notify/uninstall",
        type: "api",
      },
    ],
  },
  {
    name: "ORDER_PAID",
    subscribers: [
      {
        handler: "api/subscriber/orderPaidToDB",
        type: "api",
      },
    ],
  },
  {
    name: "SEND_ORDER_EMAIL",
    subscribers: [
      {
        handler: "api/subscriber/sendOrderEmail",
        type: "api",
      },
    ],
  },
];

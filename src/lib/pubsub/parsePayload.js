export const parsePayload = async (body) => {
  if (!body) {
    return { isConfirmation: null, payload: null };
  }

  const { Message, Type, SubscribeURL } = body;

  if (!Message || !Type) {
    return { isConfirmation: null, payload: null };
  }

  // check if the message is a subscription confirmation
  if (Type === "SubscriptionConfirmation") {
    console.log("confirming subscription");
    if (SubscribeURL) {
      await fetch(SubscribeURL);
    }
    return { isConfirmation: true, payload: null };
  }

  const payload = JSON.parse(Message);

  if (payload.secret !== process.env.SNS_SECRET) {
    return { isConfirmation: null, payload: null };
  }

  return { payload, isConfirmation: false };
};

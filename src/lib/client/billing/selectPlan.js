export const selectPlan = async (planId) => {
  try {
    const res = await fetch("/api/billing/select-plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ planId }),
    });

    if (!res.ok) {
      throw new Error("Failed to select plan");
    }

    const { success, message, redirect } = await res.json();

    if (!success) {
      throw new Error(message ?? "Failed to select plan");
    }

    if (redirect) {
      // redirect to approve charge
      open(redirect, "_top");
    } else {
      // refresh - switch to free plan
      window.location.reload();
    }
  } catch (error) {
    // TODO: Shopify doesn't like using toast for errors
    // we need to switch to display an error banner with a link to contact support
    shopify.toast.show(error ?? "Switching billing plans failed", {
      duration: 5000,
      isError: true,
    });
  }
};

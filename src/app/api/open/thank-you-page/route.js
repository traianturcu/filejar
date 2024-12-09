import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const GET = async (request) => {
  try {
    const shop = request?.nextUrl?.searchParams?.get("shop");
    const order = request?.nextUrl?.searchParams?.get("order");
    const token = request?.nextUrl?.searchParams?.get("token");
    const isEditor = request?.nextUrl?.searchParams?.get("isEditor") === "true";

    // TODO: check if the active billing plan includes thank you page extension
    // and if the extension is enabled

    const { data: shopData } = await supabase.from("shop").select("*").eq("id", shop).single();

    const headline = shopData?.settings?.thank_you_page?.headline;
    const body = shopData?.settings?.thank_you_page?.body;
    const buttonText = shopData?.settings?.thank_you_page?.button_text;
    const showPoweredBy = shopData?.settings?.thank_you_page?.show_powered_by === false ? false : true;

    if (isEditor) {
      return Response.json(
        {
          success: true,
          headline,
          body,
          buttonText,
          url: "#",
          showPoweredBy,
        },
        {
          status: 200,
        }
      );
    }

    const { data: orderData } = await supabase.from("order").select("*").eq("shop", shop).eq("order_id", order).single();

    let newOrderData;
    if (!orderData) {
      const { data } = await supabase.from("order").insert({
        shop,
        order_id: order,
      });

      newOrderData = data;
    }

    const url = `${shopData?.details?.primaryDomain?.url ?? shopData?.details?.url}/apps/${process.env.APP_HANDLE}/download/${
      orderData?.id ?? newOrderData?.id
    }`;

    return Response.json(
      {
        success: true,
        headline,
        body,
        buttonText,
        url,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
};

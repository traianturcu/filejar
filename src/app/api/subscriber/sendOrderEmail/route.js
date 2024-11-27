import { getShop } from "@/lib/shop";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const POST = async (req) => {
  try {
    const { Message } = await req.json();
    const { shop, order } = JSON.parse(Message);
    if (!shop || !order) {
      throw new Error("Shop or order not found");
    }

    // get order from supabase
    const { data: currentOrder } = await supabase.from("order").select("*").eq("order_id", order.id).eq("shop", shop).single();

    if (currentOrder?.initial_email_sent) {
      return Response.json({ skipped: true, reason: "email already sent" }, { status: 200 });
    }

    if (order.financial_status !== "paid") {
      return Response.json({ skipped: true, reason: "not paid" }, { status: 200 });
    }

    if (currentOrder?.risk_level === "high") {
      return Response.json({ skipped: true, reason: "high risk" }, { status: 200 });
    }

    if (!currentOrder?.is_digital) {
      return Response.json({ skipped: true, reason: "not digital" }, { status: 200 });
    }

    await supabase.from("order").update({ initial_email_sent: true }).eq("order_id", order.id).eq("shop", shop);

    console.log("=== passed all checks ===");

    /* OPTION 1: POSTMARK */
    const smtp_host = process.env.POSTMARK_HOST;
    const smtp_user = process.env.POSTMARK_API_TOKEN;
    const smtp_pass = process.env.POSTMARK_API_TOKEN;
    const smtp_email = process.env.POSTMARK_EMAIL;

    /* OPTION 2: SES */
    // const smtp_host = process.env.SES_HOST;
    // const smtp_user = process.env.SES_USERNAME;
    // const smtp_pass = process.env.SES_PASSWORD;
    // const smtp_email = process.env.SES_EMAIL;

    const shopData = await getShop(shop);
    const shop_name = shopData?.details?.name;
    const customer_email = order?.customer?.email;
    const customer_first_name = order?.customer?.first_name;
    const order_name = order?.name;

    const transporter = nodemailer.createTransport({
      host: smtp_host,
      port: 587,
      auth: {
        user: smtp_user,
        pass: smtp_pass,
      },
    });

    const mailOptions = {
      from: `"${shop_name}" <${smtp_email}>`,
      to: customer_email,
      subject: `Download your content for order ${order_name}`,
      text: `
      Hello ${customer_first_name},

      Your order ${order_name} has been paid for. You can download your content below.

      Best regards,
      ${shop_name} Team
      `,
      html: `
      <p>Hello ${customer_first_name},</p>
      <br />
      <p>Your order ${order_name} has been paid for. You can download your content below.</p>

      <p>Best regards,</p>
      <p>${shop_name} Team</p>
      `,
      headers: {
        "X-PM-Message-Stream": "outbound",
      },
    };

    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email", error);
          reject(error);
        } else {
          console.log("Email sent", info);
          resolve(info);
        }
      });
    });

    return Response.json(
      {
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error handling orderPaidToDB", error);
    return Response.json(
      {
        success: false,
        error,
      },
      { status: 500 }
    );
  }
};

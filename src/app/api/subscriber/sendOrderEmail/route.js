import { getShop } from "@/lib/shop";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { publish } from "@/lib/pubsub";

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

    const email_sender = uuidv4();

    await supabase.from("order").update({ initial_email_sent: true, email_sender }).eq("order_id", order.id).eq("shop", shop);

    // passed all checks
    // wait for 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // to prevent duplicate emails, check that the email_sender is this service
    const { data: email_sender_data } = await supabase.from("order").select("email_sender").eq("email_sender", email_sender).eq("shop", shop).single();
    if (!email_sender_data) {
      return Response.json({ skipped: true, reason: "email sending assigned to another service" }, { status: 200 });
    }

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
    const order_id = order?.id;

    const transporter = nodemailer.createTransport({
      host: smtp_host,
      port: 587,
      auth: {
        user: smtp_user,
        pass: smtp_pass,
      },
    });

    const email_date = new Date().toISOString();

    const mailOptions = {
      from: `"${shop_name}" <${smtp_email}>`,
      to: customer_email,
      subject: `Download your content for order ${order_name}`,
      text: `
      Hello ${customer_first_name},

      Your order ${order_name} has been paid for. You can download your content below.

      Best regards,
      ${shop_name} Team
      ${email_date}
      Powered by ${process.env.APP_NAME}
      `,
      html: `
      <p>Hello ${customer_first_name},</p>
      <br />
      <p>Your order ${order_name} has been paid for. You can download your content below.</p>
      <br/>
      <p>Best regards,</p>
      <p>${shop_name} Team</p>
      <p>${email_date}</p>
      <p>Powered by ${process.env.APP_NAME}</p>
      `,
      headers: {
        "X-PM-Message-Stream": "outbound",
      },
    };

    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);
        } else {
          resolve(info);
        }
      });
    });

    // fulfill items
    await publish("FULFILL_ITEMS", {
      order_id,
      shop,
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

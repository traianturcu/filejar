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
    const { data: currentOrder } = await supabase.from("order").select("is_digital").eq("order_id", order.id).eq("shop", shop).single();

    console.log("sendOrderEmail", {
      shop,
      order,
      financial_status: order.financial_status,
      risk_level: currentOrder?.risk_level,
      is_digital: currentOrder?.is_digital,
    });

    if (order.financial_status !== "paid") {
      return Response.json({ skipped: true, reason: "not paid" }, { status: 200 });
    }

    if (currentOrder?.risk_level === "high") {
      return Response.json({ skipped: true, reason: "high risk" }, { status: 200 });
    }

    if (!currentOrder?.is_digital) {
      return Response.json({ skipped: true, reason: "not digital" }, { status: 200 });
    }

    const shopData = await getShop(shop);
    const shop_name = shopData?.details?.name;
    const customer_email = order?.customer?.email;
    const customer_first_name = order?.customer?.first_name;
    const order_name = order?.name;

    console.log("send email", {
      shop,
      order,
      shop_name,
      customer_email,
      customer_first_name,
      order_name,
      email: process.env.POSTMARK_EMAIL,
      host: process.env.POSTMARK_HOST,
      token: process.env.POSTMARK_API_TOKEN,
    });

    const transporter = nodemailer.createTransport({
      host: process.env.POSTMARK_HOST,
      port: 587,
      secure: process.env.NODE_ENV !== "development",
      auth: {
        user: process.env.POSTMARK_API_TOKEN,
        pass: process.env.POSTMARK_API_TOKEN,
      },
    });

    const mailOptions = {
      from: `"${shop_name}" <${process.env.POSTMARK_EMAIL}>`,
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

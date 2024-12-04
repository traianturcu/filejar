import nodemailer from "nodemailer";

export const sendEmail = async ({ to, from_name, subject, html, text }) => {
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

  const transporter = nodemailer.createTransport({
    host: smtp_host,
    port: 587,
    auth: {
      user: smtp_user,
      pass: smtp_pass,
    },
  });

  const mailOptions = {
    from: `"${from_name}" <${smtp_email}>`,
    to,
    subject,
    text,
    html,
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
};

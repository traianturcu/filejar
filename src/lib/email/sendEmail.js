import nodemailer from "nodemailer";

export const sendEmail = async ({ to, from_name, subject, html, text, from_email, private_smtp }) => {
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

  const has_private_smtp = private_smtp?.username && private_smtp?.password && private_smtp?.host && private_smtp?.email;

  const transporter = nodemailer.createTransport({
    host: has_private_smtp ? private_smtp?.host : smtp_host,
    port: 587,
    auth: {
      user: has_private_smtp ? private_smtp?.username : smtp_user,
      pass: has_private_smtp ? private_smtp?.password : smtp_pass,
    },
  });

  const mailOptions = {
    from: `"${from_name}" <${has_private_smtp ? private_smtp?.email : from_email ?? smtp_email}>`,
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

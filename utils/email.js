const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // 1) Create a transporter

  // For Gmail
  // Don't use gmail because it's < 500 emails per day,
  // and you'll be marked as scammer if it's too many emails per day

  // const transporter = nodemailer.createTransport({
  //   service: 'Gmail',
  //   auth: {
  //     user: process.env.EMAIL_USERNAME_GMAIL,
  //     pass: process.env.EMAIL_PASSWORD_GMAIL
  //   }
  //
  //   // Activate in gmail "less secure app" option
  // });

  // Using mail trap
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Haris Abdullah <hello@haris.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  }

  // 3) Send the email with nodemailer
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
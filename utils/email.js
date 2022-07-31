const nodemailer = require('nodemailer');
const pug = require('pug');
const sendinBlue = require('nodemailer-sendinblue-transport');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`;
  }

  createTransport() {
    if(process.env.NODE_ENV === 'production') {
      // Sendgrid
      // using sendInBlue for now
      console.log('Using SendinBlue');
      return nodemailer.createTransport({
        service: 'SendinBlue', // no need to set host or port etc.
        auth: {
          user: 'backescape9@gmail.com',
          pass: 'HafOULxrv7tKpsEV'
        }
      });
    }
    // Development or Test
    // Using mail trap
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Send the actual emails
  async send(template, subject) {
    // 1) Render HTML based on the pub template
    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });

    // 2) Define the emails options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    }

    // 3) Create a transport and send emails
    await this.createTransport().sendMail(mailOptions);

  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      `Your password reset token (valid for only ${process.env.PASSWORD_RESRE_EXPIRES_IN} minutes)`
    );
  }
}




  // For Gmail
  // Don't use gmail because it's < 500 emails per day,
  // and you'll be marked as spammer if it's too many emails per day

  // const transporter = nodemailer.createTransport({
  //   service: 'Gmail',
  //   auth: {
  //     user: process.env.EMAIL_USERNAME_GMAIL,
  //     pass: process.env.EMAIL_PASSWORD_GMAIL
  //   }
  //
  //   // Activate in gmail "less secure app" option
  // });

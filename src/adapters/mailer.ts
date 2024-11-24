import { createTransport, Transporter } from "nodemailer";

export class Mailer {
  private transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async mail(subject: string, message: string) {
    try {
      await this.transporter.sendMail({
        from: "scraper@fleb.us",
        to: "gi11i4m@gmail.com",
        subject,
        html: message,
      });
      return true;
    } catch (error) {
      console.error("❌  Error sending email ", error);
      return false;
    }
  }
}

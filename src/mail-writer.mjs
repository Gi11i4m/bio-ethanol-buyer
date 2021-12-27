import { writeFileSync } from "fs";

const MAIL_FILENAME = "mail.md";

export class MailWriter {
  constructor() {
    this.mail = "";
  }

  /** @param {string} text */
  append(text) {
    this.mail += text + "\n";
  }

  write() {
    if (this.mail.trim() !== "") {
      writeFileSync(MAIL_FILENAME, this.mail);
    }
  }
}

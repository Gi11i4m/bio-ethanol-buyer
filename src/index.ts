import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { main } from "./commands/main";

export interface Args {
  jsonbinAuth: string;
  ci: boolean;
  sendMail: boolean;
  mailUsername: string;
  mailPassword: string;
}

yargs(hideBin(process.argv))
  .env()
  .options({
    jsonbinAuth: {
      demandOption: false,
      type: "string",
      describe: "Auth key for JSONBIN",
    },
    ci: {
      demandOption: false,
      type: "boolean",
      describe: "Weather or not we're running on CI",
      default: false,
    },
    sendMail: {
      demandOption: false,
      type: "boolean",
      describe: "Weather or not to write a file to e-mail",
      default: true,
    },
    mailUsername: {
      demandOption: false,
      type: "string",
      describe: "Mail server username",
    },
    mailPassword: {
      demandOption: false,
      type: "string",
      describe: "Mail server password",
    },
  })
  .command(
    "$0",
    "Find the cheapest prices",
    {},
    async (args) => await main(args as unknown as Args),
  )
  .parse();

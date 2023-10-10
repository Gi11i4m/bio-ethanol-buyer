import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { main } from "./commands/main";

export interface Args {
  jsbinAuth: string;
  ci: boolean;
  sendMail: boolean;
}

yargs(hideBin(process.argv))
  .env()
  .options({
    jsbinAuth: {
      demandOption: false,
      type: "string",
      describe: "Auth key for JSBIN",
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
  })
  .command(
    "$0",
    "Find the cheapest prices",
    {},
    async (args) => await main(args as unknown as Args),
  )
  .parse();

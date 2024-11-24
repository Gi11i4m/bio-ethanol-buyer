import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { main } from "./commands/main";

export interface Args {
  testRun: boolean;
  openaiApiKey: string;
  notionToken: string;
  notionDbId: string;
  ci: boolean;
  mailUsername: string;
  mailPassword: string;
}

yargs(hideBin(process.argv))
  .env()
  .options({
    ci: {
      demandOption: false,
      type: "boolean",
      describe: "Wether or not we're running on CI",
      default: false,
    },
    testRun: {
      demandOption: false,
      type: "boolean",
      describe: "When set to true, won't save data or send mails",
      default: false,
    },
    notionToken: {
      demandOption: true,
      type: "string",
      describe: "Auth key for NOTION",
    },
    notionDbId: {
      demandOption: true,
      type: "string",
      describe: "Notion DB id to use",
    },
    mailUsername: {
      demandOption: true,
      type: "string",
      describe: "Mail server username",
    },
    mailPassword: {
      demandOption: true,
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

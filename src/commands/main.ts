import { Storage } from "../adapters/storage";
import { MailWriter } from "../adapters/mail-writer";
import chalk from "chalk";
import terminalLink from "terminal-link";
import { readableList } from "../util/console";
import { Args } from "../index";
import { AiScraper, WebsiteScrapeConfig } from "../model/ai-scraper";

// TODO: get these from another Notion DB
const websitesToScrapeWithAi: WebsiteScrapeConfig[] = [
  {
    baseUrl: "https://www.bol.com",
    productsUrl:
      "https://www.bol.com/be/nl/s/?page={{PAGE}}&searchtext=bio-ethanol&view=list&N=18273&12194=7-500&rating=all",
    itemSelector: ".product-item--row",
    titleSelector: `*[data-test="product-title"]`,
    priceSelector: `*[data-test="priceBlockPrice"]`,
    urlSelector: `*[data-test="product-title"]`,
  },
];

export async function main(args: Args) {
  const scraper = new AiScraper(args.openaiApiKey, websitesToScrapeWithAi);
  const storage = new Storage({
    notionAuth: args.notionAuth,
    notionDbId: args.notionDbId,
  });
  const mailWriter = new MailWriter();

  await scraper.preScrapeWebsites();
  console.log(
    chalk.yellow(
      `🔥 Scraping bio-ethanol prices from ${scraper.numberOfSources} sources...`,
    ),
  );
  await scraper.parsePreScrapedWebsites();
  const mostExpensive = scraper.mostExpensive;
  const cheapest = scraper.cheapest;
  const list = scraper.list;

  if (!mostExpensive || !cheapest) {
    console.log(chalk.magenta(`🚫 Something went wrong`));
    process.exit(1);
  }

  console.log(
    chalk.bold.red(
      `\n📈 Highest price per liter is ${
        mostExpensive.pricePerLiter
      } at ${terminalLink(mostExpensive.name, mostExpensive.url)}`,
    ),
  );

  console.log(
    chalk.bold.green(
      `\n📉 Lowest price per liter is ${
        cheapest.pricePerLiter
      } at ${terminalLink(cheapest.name, cheapest.url)}`,
    ),
  );

  console.log(
    `\n📃 Other prices from cheap to expensive: \n${chalk.bold.blueBright(
      readableList(
        list.map((item) => ({
          name: item.name,
          amount: item.amountOfLiters,
          status: "✨",
          url: item.url,
          pricePerLiter: item.pricePerLiter,
          priceQuerySelector: "",
        })),
      ).join("\n"),
    )}`,
  );
  //
  // console.log(`💾 Saving new prices`);
  // await storage.updatePrices(scraper.rows);
  //
  // console.log(`♻️ Comparing to previous prices`);
  // if (mostExpensive.status !== "📈" && cheapest.status !== "📉") {
  //   console.log(chalk.magenta(`🚫 No new prices found`));
  //   process.exit(0);
  // }
  //
  // console.log(chalk.cyan(`🔦 New prices found`));
  //
  // if (args.sendMail) {
  //   console.log(chalk.cyan(`📬 Writing e-mail`));
  //
  //   if (mostExpensive.status === "📈") {
  //     mailWriter.append(
  //       `📈 Highest price per liter raised to ${mostExpensive.pricePerLiter} at [${mostExpensive.name}](${mostExpensive.url})\n`,
  //     );
  //   }
  //   if (cheapest.status === "📉") {
  //     mailWriter.append(
  //       `📉 Lowest price per liter lowered to ${cheapest.pricePerLiter} at [${cheapest.name}](${cheapest.url})\n`,
  //     );
  //   }
  //   mailWriter.append(`\n📃 Other prices:\n`);
  //   mailWriter.append(
  //     list
  //       .map(
  //         (product) =>
  //           `- [${product.name}](${product.url}): €${product.pricePerLiter}/L (${product.amount}L)`,
  //       )
  //       .join("\n"),
  //   );
  //   mailWriter.write();
  // }
}

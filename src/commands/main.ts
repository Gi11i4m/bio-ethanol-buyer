import { Scraper } from "../model/scraper";
import { Storage } from "../adapter/storage";
import { MailWriter } from "../adapter/mail-writer";
import chalk from "chalk";
import terminalLink from "terminal-link";
import { readableList } from "../util/console";
import { Args } from "../index";

export async function main(args: Args) {
  const storage = new Storage({
    notionAuth: args.notionAuth,
    notionDbId: args.notionDbId,
  });

  const scraper = new Scraper(await storage.getPrices());
  const mailWriter = new MailWriter();

  console.log(
    chalk.yellow(
      `🔥 Scraping bio-ethanol prices from ${scraper.numberOfSources} sources...`,
    ),
  );

  await scraper.scrapeBioEthanolPrices();
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
      readableList(list).join("\n"),
    )}`,
  );

  console.log(`💾 Saving new prices`);
  await storage.updatePrices(scraper.rows);

  console.log(`♻️ Comparing to previous prices`);
  if (mostExpensive.status !== "📈" && cheapest.status !== "📉") {
    console.log(chalk.magenta(`🚫 No new prices found`));
    process.exit(0);
  }

  console.log(chalk.cyan(`🔦 New prices found`));

  if (args.sendMail) {
    console.log(chalk.cyan(`📬 Writing e-mail`));

    if (mostExpensive.status === "📈") {
      mailWriter.append(
        `📈 Highest price per liter raised to ${mostExpensive.pricePerLiter} at [${mostExpensive.name}](${mostExpensive.url})\n`,
      );
    }
    if (cheapest.status === "📉") {
      mailWriter.append(
        `📉 Lowest price per liter lowered to ${cheapest.pricePerLiter} at [${cheapest.name}](${cheapest.url})\n`,
      );
    }
    mailWriter.append(`\n📃 Other prices:\n`);
    mailWriter.append(
      list
        .map(
          (product) =>
            `- [${product.name}](${product.url}): €${product.pricePerLiter}/L (${product.amount}L)`,
        )
        .join("\n"),
    );
    mailWriter.write();
  }
}

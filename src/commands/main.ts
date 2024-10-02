import { Scraper } from "../model/scraper";
import { PRODUCTS } from "../resources/products";
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

  const prices = await storage.getPrices();
  // const products: Product[] = prices.map(({}) => new Product(new Provider(), ))
  const scraper = new Scraper(PRODUCTS);
  const mailWriter = new MailWriter();

  console.log(
    chalk.yellow(
      `🔥 Scraping bio-ethanol prices from ${scraper.numberOfSources} sources...`,
    ),
  );

  await scraper.fetchBioEthanols();
  const mostExpensive = scraper.mostExpensive;
  const cheapest = scraper.cheapest;
  const list = scraper.list;

  console.log(
    chalk.bold.red(
      `\n📈 Highest price per liter is ${
        mostExpensive.pricePerLiter
      } at ${terminalLink(
        mostExpensive.product.provider.name,
        mostExpensive.product.urlEncoded,
      )}`,
    ),
  );

  console.log(
    chalk.bold.green(
      `\n📉 Lowest price per liter is ${
        cheapest.pricePerLiter
      } at ${terminalLink(
        cheapest.product.provider.name,
        cheapest.product.urlEncoded,
      )}`,
    ),
  );

  console.log(
    `\n📃 Other prices from cheap to expensive: \n${chalk.bold.blueBright(
      readableList(list).join("\n"),
    )}`,
  );

  const savedPrices = await storage.getPrices();
  console.log(savedPrices);

  console.log(`💾 Saving new prices`);
  await storage.updatePrices(scraper.list);

  console.log(`♻️ Comparing to previous prices`);
  // TODO: compare
  const highestPPL = 0;
  const lowestPPL = 0;

  if (
    !(
      mostExpensive.pricePerLiter !== highestPPL ||
      cheapest.pricePerLiter !== lowestPPL
    )
  ) {
    console.log(chalk.magenta(`🚫 No new prices found`));
    process.exit(0);
  }

  console.log(chalk.cyan(`🔦 New prices found`));

  if (args.sendMail) {
    console.log(chalk.cyan(`📬 Writing e-mail`));

    if (mostExpensive.pricePerLiter !== highestPPL) {
      mailWriter.append(
        `📈 Highest price per liter went from ${highestPPL} to ${mostExpensive.pricePerLiter} at [${mostExpensive.product.provider.name}](${mostExpensive.product.url})\n`,
      );
    }
    if (cheapest.pricePerLiter !== lowestPPL) {
      mailWriter.append(
        `📉 Lowest price per liter went from ${lowestPPL} to ${cheapest.pricePerLiter} at [${cheapest.product.provider.name}](${cheapest.product.url})\n`,
      );
    }
    mailWriter.append(`\n📃 Other prices:\n`);
    mailWriter.append(
      list
        .map(
          (product) =>
            `- [${product.product.provider.name}](${product.product.urlEncoded}): €${product.pricePerLiter}/L (${product.product.amount}L)`,
        )
        .join("\n"),
    );
    mailWriter.write();
  }
}

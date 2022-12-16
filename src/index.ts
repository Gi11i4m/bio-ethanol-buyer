import chalk from "chalk";
import dotenv from "dotenv";
import terminalLink from "terminal-link";
import {
  BioEthanolScraper,
  productUrl,
  providerName,
  readableList,
} from "./bio-ethanols";
import { MailWriter } from "./mail-writer";
import { Storage } from "./storage";

dotenv.config();

const bioEthanolScraper = new BioEthanolScraper();
const storage = new Storage(process.env.JSONBIN_AUTH!);
const mailWriter = new MailWriter();

(async () => {
  console.log(
    chalk.yellow(
      `🔥 Scraping bio-ethanol prices from ${bioEthanolScraper.numberOfSources} sources...`
    )
  );

  await bioEthanolScraper.fetchBioEthanols();
  const [highest, lowest, list] = [
    bioEthanolScraper.mostExpensive,
    bioEthanolScraper.cheapest,
    bioEthanolScraper.list,
  ];

  console.log(
    chalk.bold.red(
      `\n📈 Highest price per liter is ${
        highest.pricePerLiter
      } at ${terminalLink(providerName(highest.provider), productUrl(highest))}`
    )
  );

  console.log(
    chalk.bold.green(
      `\n📉 Lowest price per liter is ${lowest.pricePerLiter} at ${terminalLink(
        providerName(lowest.provider),
        productUrl(lowest)
      )}`
    )
  );

  console.log(
    `\n📃 Other prices from cheap to expensive: \n${chalk.bold.blueBright(
      readableList(list).join("\n")
    )}`
  );

  const savedPrices = await storage.getPrices();

  console.log(`♻️ Comparing to previous prices`);
  const { highestPPL, lowestPPL } = savedPrices[savedPrices.length - 1] ||
    savedPrices[0] || { highestPPL: 0, lowestPPL: Infinity };

  if (
    !(
      highest.pricePerLiter !== highestPPL || lowest.pricePerLiter !== lowestPPL
    )
  ) {
    console.log(chalk.magenta(`🚫 No new prices found`));
    process.exit(0);
  }

  console.log(chalk.cyan(`📬 New prices found, writing e-mail`));

  if (highest.pricePerLiter !== highestPPL) {
    mailWriter.append(
      `📈 Highest price per liter went from ${highestPPL} to ${
        highest.pricePerLiter
      } at [${providerName(highest.provider)}](${productUrl(highest)})\n`
    );
  }
  if (lowest.pricePerLiter !== lowestPPL) {
    mailWriter.append(
      `📉 Lowest price per liter went from ${lowestPPL} to ${
        lowest.pricePerLiter
      } at [${providerName(lowest.provider)}](${productUrl(lowest)})\n`
    );
  }
  mailWriter.append(`\n📃 Other prices:\n`);
  mailWriter.append(
    list
      .map(
        ({ provider, url, pricePerLiter, amount }) =>
          `- [${providerName(provider)}](${productUrl({
            provider,
            url,
          })}): €${pricePerLiter}/L (${amount}L)`
      )
      .join("\n")
  );
  mailWriter.write();

  console.log(`💾 Saving new prices`);
  await storage.addPrice({
    date: new Date(),
    highestPPL: highest.pricePerLiter,
    lowestPPL: lowest.pricePerLiter,
  });
})();

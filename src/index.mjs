import { BioEthanolScraper, productUrl } from "./bio-ethanols.mjs";
import { MailWriter } from "./mail-writer.mjs";
import { Storage } from "./storage.mjs";
import dotenv from "dotenv";

dotenv.config();

const bioEthanolScraper = new BioEthanolScraper();
const storage = new Storage(process.env.JSBIN_AUTH);
const mailWriter = new MailWriter();

await (async () => {
  console.log(
    `🔥 Scraping bio-ethanol prices from ${bioEthanolScraper.numberOfSources} sources...`
  );

  await bioEthanolScraper.fetchBioEthanols();
  const highest = bioEthanolScraper.getMostExpensive();
  const lowest = bioEthanolScraper.getCheapest();

  console.log(
    `📈 Highest price per liter is ${highest.pricePerLiter} at ${productUrl(
      highest
    )}`
  );

  console.log(
    `📉 Lowest price per liter is ${lowest.pricePerLiter} at ${productUrl(
      lowest
    )}`
  );

  const savedPrices = await storage.getPrices();

  console.log(`♻️ Comparing to previous prices`);
  const { highestPPL, lowestPPL } = savedPrices[savedPrices.length - 1] ||
    savedPrices[0] || { highestPPL: 0, lowestPPL: Infinity };

  if (
    !(highest.pricePerLiter !== highestPPL || lowest.pricePerLiter !== lowestPPL)
  ) {
    console.log(`🚫 No new prices found`);
    process.exit(0);
  }

  console.log(`📬 New prices found, writing e-mail`);

  if (highest.pricePerLiter !== highestPPL) {
    mailWriter.append(
      `[Highest price per liter went from ${highestPPL} to ${highest.pricePerLiter}](${productUrl(
        highest
      )})`
    );
  }
  if (lowest.pricePerLiter !== lowestPPL) {
    mailWriter.append(
      `[Lowest price per liter went from ${lowestPPL} to ${lowest.pricePerLiter}](${productUrl(
        lowest
      )})`
    );
  }
  mailWriter.write();

  console.log(`💾 Saving new prices`);
  await storage.addPrice({
    highestPPL: highest.pricePerLiter,
    lowestPPL: lowest.pricePerLiter,
  });
})();

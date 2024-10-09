import { MailWriter } from "../adapters/mail-writer";
import chalk from "chalk";
import { Args } from "../index";
import { ScraperV2, WebsiteScrapeConfig } from "../model/scraper-v2";
import { Row } from "../model/row";
import { Notion, NotionRowValue } from "../adapters/notion";

// TODO: get these from another Notion DB
const websitesToScrape: WebsiteScrapeConfig[] = [
  {
    baseUrl: "https://www.bol.com",
    productsUrl:
      "https://www.bol.com/be/nl/s/?page={{PAGE}}&searchtext=bio-ethanol&view=list&N=18273&12194=7-500&rating=all",
    itemParser: "",
    fieldToCompare: "pricePerLiter",
  },
];

export async function main(args: Args) {
  const scraper = new ScraperV2(websitesToScrape);
  const notion = new Notion(args.notionAuth, args.notionDbId);

  console.log(
    chalk.yellow(
      `🔥 Scraping bio-ethanol prices from ${scraper.configs.length} sources...`,
    ),
  );

  await scraper.scrapeWebsites<Row>();

  console.log(
    chalk.green(
      `✅  Scraped ${scraper.rows.length} products from ${scraper.configs.length} source`,
    ),
  );

  console.log(
    chalk.red(`💾 Saving ${scraper.rows.length} products to Notion...`),
  );

  for (const row of scraper.rows) {
    await notion.upsertRow<keyof Row, NotionRowValue>(row, "url");
  }

  // Check if field to compare has changed
  // No? TODO: Exit

  // Yes? TODO: Send mail
  const mailWriter = new MailWriter();
}

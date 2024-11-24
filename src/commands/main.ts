import { Mailer } from "../adapters/mailer";
import chalk from "chalk";
import { Args } from "../index";
import { Scraper } from "../adapters/scraper";
import { Row } from "../model/row";
import { Notion, NotionRow } from "../adapters/notion";
import { SCRAPER_CONFIG } from "../data/scraper.config";
import { conjugate } from "../util/string";

export async function main(args: Args) {
  const scraper = new Scraper(SCRAPER_CONFIG);
  const notion = new Notion(args.notionAuth, args.notionDbId);
  const mailer = new Mailer();

  const previousScrapeResults = await notion.getRows<NotionRow>();

  console.log(
    chalk.yellow(
      `🔥 Scraping bio-ethanol prices from ${conjugate(
        "source",
        scraper.config.websites.length,
      )}...`,
    ),
  );

  await scraper.scrapeWebsites<Row>();

  console.log(
    chalk.green(
      `💾 Saving ${scraper.rows.length} products from ${conjugate(
        "source",
        scraper.config.websites.length,
      )} to Notion...`,
    ),
  );

  // for (const row of scraper.rows) {
  //   await notion.upsertRow<keyof Row, NotionRowValue>(row, "url");
  // }

  const valueToWatchNotification = SCRAPER_CONFIG.notificationFn(
    previousScrapeResults,
    scraper.rows,
  );
  if (valueToWatchNotification) {
    console.log(chalk.red(`🔔 ${valueToWatchNotification}... Sending mail 📧`));
    await mailer.mail(
      `👁️‍🗨️ New information from ${scraper.config.name}`,
      valueToWatchNotification,
    );
  } else {
    console.log(chalk.green(`🔕 No relevant changes`));
  }
}

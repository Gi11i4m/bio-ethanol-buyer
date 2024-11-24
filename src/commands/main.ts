import { Mailer } from "../adapters/mailer";
import chalk from "chalk";
import { Args } from "../index";
import { Scraper } from "../adapters/scraper";
import { Notion, NotionRow } from "../adapters/notion";
import { SCRAPER_CONFIG } from "../data/scraper.config";
import { conjugate } from "../util/string";

export async function main(args: Args) {
  const scraper = new Scraper(SCRAPER_CONFIG);
  const notion = new Notion(args.notionToken, args.notionDbId);
  const mailer = new Mailer();

  const previousScrapeResults = await notion.getRows<NotionRow>();

  if (args.testRun) {
    console.log(chalk.cyan(`🧪 TEST RUN - NOT SAVING OR MAILING RESULTS`));
  }

  console.log(
    chalk.yellow(
      `🔥 Scraping bio-ethanol prices from ${conjugate(
        "source",
        scraper.enabledWebsites.length,
      )}...`,
    ),
  );

  const currentScrapeResults = await scraper.scrapeWebsites<NotionRow>();

  console.log(
    chalk.green(
      `💾 Saving ${currentScrapeResults.length} products from ${conjugate(
        "source",
        scraper.enabledWebsites.length,
      )} to Notion...`,
    ),
  );

  if (!args.testRun) {
    for (const row of currentScrapeResults) {
      await notion.upsertRow(row, "url");
    }
  }

  const valueToWatchNotification = SCRAPER_CONFIG.notificationFn(
    previousScrapeResults,
    currentScrapeResults,
  );
  if (valueToWatchNotification) {
    console.log(chalk.red(`🔔 ${valueToWatchNotification}... Sending mail 📧`));
    if (!args.testRun) {
      await mailer.mail(
        `👁️‍🗨️ New information from ${scraper.config.name}`,
        valueToWatchNotification,
      );
    }
  } else {
    console.log(chalk.green(`🔕 No relevant changes`));
  }
}

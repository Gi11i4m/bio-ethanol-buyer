import axios from "axios";
import { JSDOM } from "jsdom";
import { NotionRow } from "./notion";
import { PAGE_MARKER } from "../data/scraper.config";

export type WebsiteScraperConfig = {
  baseUrl: string;
  enabled: boolean;
  productsUrl: string;
  itemParser: (itemParserUtilities: {
    document: Document;
    baseUrl: string;
  }) => NotionRow[];
};

export type ScraperConfig = {
  name: string;
  notificationFn(previousScrapeResults: any[], results: any[]): string | null;
  websites: WebsiteScraperConfig[];
};

export class Scraper {
  private rows: NotionRow[] = [];

  constructor(public config: ScraperConfig) {}

  async scrapeWebsites<R extends NotionRow>(): Promise<R[]> {
    for (const config of this.enabledWebsites) {
      process.stdout.write(`📃 Scraped page (${config.baseUrl}) `);
      await this.scrapeWebsitePaginated(config);
    }
    return this.rows as R[];
  }

  get enabledWebsites() {
    return this.config.websites.filter((w) => w.enabled);
  }

  private async scrapeWebsitePaginated(config: WebsiteScraperConfig) {
    const websiteIsPaginated = config.productsUrl.includes(PAGE_MARKER);
    let finalPageReached = false;
    let page = 1;
    while (!finalPageReached) {
      try {
        this.rows = this.rows
          .concat(
            await this.scrapeWebsite({
              ...config,
              productsUrl: config.productsUrl.replace(
                PAGE_MARKER,
                String(page),
              ),
            }),
          )
          .filter(this.hasNoUndefinedValues);
        process.stdout.write(` ${page} `);
        page++;
        if (!websiteIsPaginated) {
          finalPageReached = true;
          console.log();
        }
      } catch (e) {
        finalPageReached = true;
        console.log();
      }
    }
  }

  private hasNoUndefinedValues(row: NotionRow) {
    return !Object.values(row).find((v) => {
      if (typeof v === "number") {
        return isNaN(v);
      }
      return !v;
    });
  }

  private async scrapeWebsite({
    baseUrl,
    productsUrl,
    itemParser,
  }: WebsiteScraperConfig): Promise<NotionRow[]> {
    const { data } = await axios.get(productsUrl);
    const document = new JSDOM(data).window.document;
    try {
      return itemParser({
        baseUrl,
        document,
      });
    } catch (e) {
      console.error(e);
      return [];
    }
  }
}

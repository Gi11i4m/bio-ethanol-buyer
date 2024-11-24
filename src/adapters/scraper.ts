import axios from "axios";
import { JSDOM } from "jsdom";

export type WebsiteScraperConfig = {
  baseUrl: string;
  productsUrl: string;
  itemParser: (itemParserUtilities: {
    document: Document;
    baseUrl: string;
  }) => Row[];
};

export type ScraperConfig = {
  name: string;
  notificationFn(previousScrapeResults: any[], results: any[]): string | null;
  websites: WebsiteScraperConfig[];
};

type Row = Record<string, string | number | boolean | undefined>;

export class Scraper {
  rows: Row[] = [];

  constructor(public config: ScraperConfig) {}

  async scrapeWebsites<R extends Row>(): Promise<R[]> {
    for (const config of this.config.websites) {
      process.stdout.write(`📃 Scraped page (${config.baseUrl}) `);
      await this.scrapeWebsitePaginated(config);
    }
    return this.rows as R[];
  }

  private async scrapeWebsitePaginated(config: WebsiteScraperConfig) {
    let finalPageReached = false;
    let page = 1;
    while (!finalPageReached) {
      try {
        this.rows = this.rows
          .concat(
            await this.scrapeWebsite({
              ...config,
              productsUrl: config.productsUrl.replace("{{PAGE}}", String(page)),
            }),
          )
          .filter((row) => !Object.values(row).includes(undefined));
        process.stdout.write(` ${page} `);
        page++;
      } catch (e) {
        finalPageReached = true;
        console.log();
      }
    }
  }

  private async scrapeWebsite({
    baseUrl,
    productsUrl,
    itemParser,
  }: WebsiteScraperConfig): Promise<Row[]> {
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

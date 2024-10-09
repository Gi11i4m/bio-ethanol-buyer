import axios from "axios";
import { JSDOM } from "jsdom";

/** The `itemParser` should be JS code that returns an object
 * with primitive types and at least a `url` field of type `string` as identifier
 *
 * The JS code has access to `document` and utility methods `clean` (string) and `extractAmountOfLiters` **/
export type WebsiteScrapeConfig = {
  baseUrl: string;
  productsUrl: string;
  itemParser: string;
  fieldToCompare: string;
};

type Row = Record<string, string | number | boolean | undefined>;

const TITLE_CUTOFF = 50;

export class ScraperV2 {
  rows: Row[] = [];

  constructor(public configs: WebsiteScrapeConfig[]) {}

  async scrapeWebsites<R extends Row>(): Promise<R[]> {
    for (const config of this.configs) {
      process.stdout.write("📃 Scraped page ");
      await this.scrapeWebsitePaginated(config);
    }
    return this.rows as R[];
  }

  private async scrapeWebsitePaginated(config: WebsiteScrapeConfig) {
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
          .filter((row) => row[config.fieldToCompare]);
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
  }: WebsiteScrapeConfig): Promise<Row[]> {
    const { data } = await axios.get(productsUrl);
    const document = new JSDOM(data).window.document;
    try {
      const itemParser = (document: Document) =>
        Array.from(document.querySelectorAll(".product-item--row")).map(
          (item) => {
            const fullTitle =
              clean(
                item.querySelector('*[data-test="product-title"]')?.textContent,
              ) +
              " " +
              clean(
                item.querySelector('*[data-test="product-specs"]')?.textContent,
              );
            const title = clamp(fullTitle);
            const price = Number(
              clean(
                item
                  .querySelector('meta[itemprop="price"]')
                  ?.getAttribute("content"),
              ),
            );
            const liters = extractAmountOfLiters(fullTitle);
            const pricePerLiter = liters
              ? Math.round((price / liters) * 100) / 100
              : undefined;
            const url =
              baseUrl +
              clean(
                item
                  .querySelector('*[data-test="product-title"]')
                  ?.getAttribute("href"),
              );
            return {
              title,
              pricePerLiter,
              url,
            };
          },
        );
      return itemParser(document);
    } catch (e) {
      console.error(e);
      return [];
    }
  }
}

/** Utility methods for the itemParser to use **/

function clean(text: string | null | undefined) {
  return text
    ? text
        .trim()
        .replaceAll("\n", "")
        .replace(/ +(?= )/g, "")
    : "";
}

function clamp(text: string) {
  return (
    text.substring(0, TITLE_CUTOFF) + (text.length > TITLE_CUTOFF ? "..." : "")
  );
}

function extractAmountOfLiters(text: string): number | undefined {
  const amountTimesLiterRegex =
    /(?<multiplier>\d+)\s?x\s?(?<amount>\d+)\s?liter/im;
  const literPlusLiterRegex =
    /(?<amount1>\d+)\s?\s?\+\s?(?<amount2>\d+)\s?liter/im;
  const literRegex = /(?<amount>\d+)\s?liter/im;

  if (amountTimesLiterRegex.test(text)) {
    const { multiplier, amount } = amountTimesLiterRegex.exec(text)?.groups!;
    const totalAmount = Number(multiplier) * Number(amount);
    if (Number.isFinite(totalAmount)) {
      return totalAmount;
    }
  } else if (literPlusLiterRegex.test(text)) {
    const { amount1, amount2 } = literPlusLiterRegex.exec(text)?.groups!;
    const totalAmount = Number(amount1) + Number(amount2);
    if (Number.isFinite(totalAmount)) {
      return totalAmount;
    }
  } else if (literRegex.test(text)) {
    const { amount } = literRegex.exec(text)?.groups!;
    const totalAmount = Number(amount);
    if (Number.isFinite(totalAmount)) {
      return totalAmount;
    }
  }
}

import axios from "axios";
import { JSDOM } from "jsdom";
import { clean } from "../util/string";
import OpenAI from "openai";
import { maxBy, minBy } from "lodash";

export type WebsiteScrapeConfig = {
  baseUrl: string;
  productsUrl: string;
  itemSelector: string;
  titleSelector: string;
  priceSelector: string;
  urlSelector: string;
};

type PreScrapedItem = {
  baseUrl: string;
  roughTitleText: string;
  roughPriceText: string;
  roughUrlText: string;
};
type ParsedItem = {
  name: string;
  url: string;
  price: number;
  amountOfLiters: number;
  pricePerLiter: number;
};

export class AiScraper {
  private client: OpenAI;
  private preScrapedItems: PreScrapedItem[] = [];
  private parsedItems: ParsedItem[] = [];

  constructor(
    apiKey: string,
    private configs: WebsiteScrapeConfig[],
  ) {
    this.client = new OpenAI({
      apiKey,
    });
  }

  async preScrapeWebsites(): Promise<void> {
    for (const config of this.configs) {
      let finalPageReached = false;
      let page = 1;
      while (!finalPageReached) {
        try {
          this.preScrapedItems = this.preScrapedItems.concat(
            await this.preScrapeWebsite({
              ...config,
              productsUrl: config.productsUrl.replace("{{PAGE}}", String(page)),
            }),
          );
          page++;
        } catch (e) {
          finalPageReached = true;
        }
      }
    }
  }

  private async preScrapeWebsite({
    baseUrl,
    productsUrl,
    itemSelector,
    titleSelector,
    priceSelector,
    urlSelector,
  }: WebsiteScrapeConfig): Promise<PreScrapedItem[]> {
    const { data } = await axios.get(productsUrl);
    const doc = new JSDOM(data).window.document;
    return Array.from(doc.querySelectorAll(itemSelector)).map((item) => ({
      baseUrl,
      roughTitleText: clean(item.querySelector(titleSelector)?.textContent),
      roughPriceText: clean(item.querySelector(priceSelector)?.textContent),
      roughUrlText: clean(
        item.querySelector(urlSelector)?.getAttribute("href"),
      ),
    }));
  }

  async parsePreScrapedWebsites(): Promise<void> {
    await this.client.beta.chat.completions
      .runTools({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: `Clean this list of bio-ethanol fuel listings.
Skip listings that aren't bio-ethanol fuel
Extract the name, url, price and amount of liters per item and then save them.

${this.preScrapedItems
  .map((item) => JSON.stringify(item, undefined, 2))
  .join("\\n-----\\n")}
`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              description: "Save the parsed bio-ethanol fuel listings",
              function: (items: { bioEthanols: ParsedItem[] }) =>
                this.saveBioEthanols(items.bioEthanols),
              parse: JSON.parse,
              parameters: {
                type: "object",
                properties: {
                  bioEthanols: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        url: { type: "string" },
                        amountOfLiters: { type: "number" },
                        price: { type: "number" },
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      })
      .finalContent();
  }

  private saveBioEthanols(bioEthanols: ParsedItem[]) {
    this.parsedItems = this.parsedItems.concat(
      bioEthanols.map((bioEthanol) => ({
        ...bioEthanol,
        pricePerLiter:
          Math.round((bioEthanol.price / bioEthanol.amountOfLiters) * 100) /
          100,
      })),
    );
  }

  logParsedItems() {
    console.log(
      this.parsedItems
        .map((item) => JSON.stringify(item, undefined, 2))
        .join("\n---\n"),
    );
  }

  get numberOfSources() {
    return this.preScrapedItems.length;
  }

  get list() {
    return this.parsedItems.sort(
      (bio1, bio2) => bio1.pricePerLiter - bio2.pricePerLiter,
    );
  }

  get mostExpensive() {
    return maxBy(this.parsedItems, (r) => r.pricePerLiter);
  }

  get cheapest() {
    return minBy(this.parsedItems, (r) => r.pricePerLiter);
  }
}

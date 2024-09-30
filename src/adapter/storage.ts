import axios, { Axios } from "axios";
import { ProductData } from "../model/product.data";
import { Notion } from "./notion";

const STORAGE_URL = "https://jsonbin.org/gi11i4m";

interface Price {
  highestPPL: number;
  lowestPPL: number;
  date: Date;
}

const EMPTY_PRICE: Price = {
  highestPPL: 0,
  lowestPPL: Infinity,
  date: new Date(),
};

interface StorageData {
  prices: Price[];
}

export interface StorageConfig {
  jsonbinAuth: string;
  notionAuth: string;
  notionDbId: string;
}

export class Storage {
  private readonly http: Axios;
  private readonly notion: Notion;

  constructor({ jsonbinAuth, notionAuth, notionDbId }: StorageConfig) {
    this.http = axios.create({
      baseURL: STORAGE_URL,
      validateStatus: (status) =>
        (status >= 200 && status < 300) || status === 422, // 422 bug, see [here](https://laracasts.com/discuss/channels/laravel/422-unprocessable-entity-when-logging-out-using-axios-headers) ;
    });
    this.http.defaults.headers.common["Authorization"] = `token ${jsonbinAuth}`;
    this.http.defaults.headers.common["Content-Type"] = "application/json";

    this.notion = new Notion(notionAuth, notionDbId);
  }

  async getPrices(): Promise<Price[]> {
    if (!(await this.http.get("/bio-ethanol")).data.prices) {
      await this.initDb();
    }
    const {
      data: { prices },
    } = await this.http.get<StorageData>("/bio-ethanol");
    return prices.map(({ date, ...rest }) => ({
      date: new Date(date),
      ...rest,
    }));
  }

  async savePrices(prices: ProductData[]) {
    for (const price of prices)
      await this.notion.addRow(
        {
          url: price.product.url.href,
          name: price.product.provider.name,
          pricePerLiter: price.pricePerLiter,
        },
        "name",
      );
  }

  async addPrice(price: Price) {
    const newPrices = {
      prices: [...(await this.getPrices()), { ...price, date: new Date() }],
    };
    return this.http.post("/bio-ethanol", newPrices);
  }

  async initDb() {
    return this.http.post("/bio-ethanol", { prices: [EMPTY_PRICE] });
  }
}

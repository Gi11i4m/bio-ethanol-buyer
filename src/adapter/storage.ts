import { ProductData } from "../model/product.data";
import { Notion } from "./notion";

export interface StorageConfig {
  notionAuth: string;
  notionDbId: string;
}

export type Row = {
  url: string;
  name: string;
  pricePerLiter: number;
  amount: number;
  priceQuerySelector: string;
};
export type RowValue = Row[keyof Row];

export class Storage {
  private readonly notion: Notion;

  constructor({ notionAuth, notionDbId }: StorageConfig) {
    this.notion = new Notion(notionAuth, notionDbId);
  }

  async getPrices(): Promise<Record<keyof Row, RowValue>[]> {
    return await this.notion.getRows<keyof Row, RowValue>();
  }

  async updatePrices(prices: ProductData[]) {
    for (const price of prices)
      await this.notion.updateRow<keyof Row, RowValue>(
        {
          url: price.product.url.href,
          name: price.product.provider.name,
          pricePerLiter: price.pricePerLiter,
          amount: price.product.amount,
          priceQuerySelector: price.product.provider.priceQuerySelector,
        },
        "name",
      );
  }
}

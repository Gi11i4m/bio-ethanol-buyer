import { Notion } from "./notion";

export interface StorageConfig {
  notionAuth: string;
  notionDbId: string;
}

export type Row = {
  url: string;
  name: string;
  amount: number;
  priceQuerySelector: string;
  pricePerLiter: number;
  status: string;
};
export type RowValue = Row[keyof Row];

export class Storage {
  private readonly notion: Notion;

  constructor({ notionAuth, notionDbId }: StorageConfig) {
    this.notion = new Notion(notionAuth, notionDbId);
  }

  async getPrices(): Promise<Row[]> {
    return await this.notion.getRows<Row>();
  }

  async updatePrices(rows: Row[]) {
    for (const row of rows)
      await this.notion.updateRow<keyof Row, RowValue>(row, "url");
  }
}

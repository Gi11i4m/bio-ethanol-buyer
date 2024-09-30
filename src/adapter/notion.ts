import { Client } from "@notionhq/client";
import { CreatePageParameters } from "@notionhq/client/build/src/api-endpoints";

export interface NotionDbRow {}

export class Notion {
  client: Client;

  constructor(
    token: string,
    private db: string,
  ) {
    this.client = new Client({
      auth: token,
    });
  }

  async addRow(row: Row, titlePropertyName: keyof Row) {
    await this.client.pages.create({
      parent: { database_id: this.db },
      // @ts-expect-error
      properties: Object.fromEntries(
        Object.entries(row).map(([name, value]) => [
          this.uppercaseFirstLetter(name),
          this.toDbValue(value, name === titlePropertyName),
        ]),
      ),
    });
  }

  private toDbValue(
    value: string | number | boolean,
    isTitle = false,
  ): PropertyValue {
    if (typeof value === "string") {
      if (isTitle) {
        return { title: [{ text: { content: value } }] };
      } else {
        return { rich_text: [{ text: { content: value } }] };
      }
    } else if (typeof value === "number") {
      return {
        number: value,
      };
    }
    return {
      checkbox: value,
    };
  }

  private uppercaseFirstLetter(text: string) {
    if (!text) {
      return "";
    }
    if (text.length === 1) {
      return text.toUpperCase();
    }
    return `${text.substring(0, 1).toUpperCase()}${text.substring(1)}`;
  }
}

type Row = Record<string, string | number | boolean>;

type PageProperties = CreatePageParameters["properties"];
type PropertyValue = PageProperties[string];

import { Client } from "@notionhq/client";
import { CreatePageParameters } from "@notionhq/client/build/src/api-endpoints";
import { lowercaseFirstLetter, uppercaseFirstLetter } from "../util/string";

type WithType<P> = P & { type: string };

export type NotionRow = Record<string, NotionPrimitiveRowValue>;

export type NotionPrimitiveRowValue = string | number | boolean;

export type NotionRowValue = Exclude<
  NonNullable<CreatePageParameters["properties"][string]>,
  string | number | boolean
>;

export class Notion {
  private client: Client;

  constructor(
    token: string,
    private db: string,
  ) {
    this.client = new Client({
      auth: token,
    });
  }

  async getRows<R>(): Promise<R[]> {
    const { results } = await this.client.databases.query({
      database_id: this.db,
    });
    // @ts-expect-error
    return results.map((res) => this.propertiesToRow(res.properties));
  }

  async updateRow<Key extends string, Value>(
    row: Record<Key, Value>,
    titlePropertyName: Key,
  ) {
    const rows = await this.client.databases.query({
      database_id: this.db,
      filter: {
        title: { equals: row[titlePropertyName] as string },
        property: uppercaseFirstLetter(titlePropertyName),
      },
    });
    const matchingPage = rows.results[0];
    if (matchingPage) {
      await this.client.pages.update({
        page_id: matchingPage.id,
        // @ts-expect-error
        properties: this.rowToProperties(row, titlePropertyName),
      });
    }
  }

  private rowToProperties(
    row: NotionRow,
    titlePropertyName: string,
  ): Record<string, NotionRowValue> {
    return Object.fromEntries<NotionRowValue>(
      Object.entries(row).map(([name, value]) => [
        uppercaseFirstLetter(name),
        this.toDbValue(value, name === titlePropertyName),
      ]),
    );
  }

  private toDbValue(
    value: string | number | boolean,
    isTitle = false,
  ): NotionRowValue {
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

  private propertiesToRow(
    row: Record<string, NotionRowValue>,
  ): Record<string, string | number | boolean> {
    return Object.fromEntries(
      Object.entries(row).map(([name, value]) => [
        lowercaseFirstLetter(name),
        this.toPrimitiveValue(value),
      ]),
    );
  }

  private toPrimitiveValue(value: NotionRowValue): string | number | boolean {
    const UNABLE_TO_PARSE = "UNABLE TO PARSE FROM DB";

    if (!this.hasType(value)) {
      return UNABLE_TO_PARSE;
    } else if (value.type === "title") {
      try {
        return (value as any).title[0].text.content;
      } catch (e) {
        return `${UNABLE_TO_PARSE} ${JSON.stringify(value)}`;
      }
    } else if (value.type === "rich_text") {
      try {
        return (value as any).rich_text[0].text.content;
      } catch (e) {
        return `${UNABLE_TO_PARSE} ${JSON.stringify(value)}`;
      }
    } else if (value.type === "number") {
      try {
        return Number((value as any).number);
      } catch (e) {
        return `${UNABLE_TO_PARSE} ${JSON.stringify(value)}`;
      }
    } else if (value.type === "checkbox") {
      try {
        return Boolean((value as any).checkbox);
      } catch (e) {
        return `${UNABLE_TO_PARSE} ${JSON.stringify(value)}`;
      }
    }
    return UNABLE_TO_PARSE;
  }

  private hasType<P extends NotionRowValue>(value: P): value is WithType<P> {
    return value.hasOwnProperty("type");
  }
}

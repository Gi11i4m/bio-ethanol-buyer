import axios from "axios";
import terminalLink from "terminal-link";
import { Row } from "../adapter/storage";
import { maxBy, minBy } from "lodash";
import { JSDOM } from "jsdom";

export class Scraper {
  constructor(public rows: Row[]) {}

  async scrapeBioEthanolPrices(): Promise<void> {
    this.rows = await Promise.all(
      this.rows.map((row) =>
        axios
          .get(row.url)
          .then(({ data }) => {
            const dom = new JSDOM(data);
            const stringPrice = eval(
              `dom.window.document.${row.priceQuerySelector}`,
            )
              .trim()
              .replace(",", ".")
              .replace("€", "");
            const pricePerLiter =
              Math.round((Number(stringPrice) / row.amount) * 100) / 100;
            return {
              ...row,
              pricePerLiter,
              status:
                row.pricePerLiter === pricePerLiter
                  ? "🟰"
                  : row.pricePerLiter > pricePerLiter
                  ? "📉"
                  : "📈",
            };
          })
          .catch((_) => {
            console.error(
              `Could not get price information for ${terminalLink(
                row.name,
                row.url,
              )}`,
            );
            return { ...row, pricePerLiter: 0, status: "❌" };
          }),
      ),
    );
  }

  get numberOfSources() {
    return this.rows.length;
  }

  get nonEmptyRows() {
    return this.rows.filter(({ pricePerLiter }) => pricePerLiter !== 0);
  }

  get list() {
    return this.nonEmptyRows.sort(
      (bio1, bio2) => bio1.pricePerLiter - bio2.pricePerLiter,
    );
  }

  get mostExpensive() {
    return maxBy(this.nonEmptyRows, (r) => r.pricePerLiter);
  }

  get cheapest() {
    return minBy(this.nonEmptyRows, (r) => r.pricePerLiter);
  }
}

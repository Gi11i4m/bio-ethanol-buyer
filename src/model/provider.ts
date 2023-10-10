import { PriceParser } from "./price-parser";

export class Provider {
  constructor(
    private url: string,
    private priceParser: PriceParser,
  ) {}

  get url() {
    return new URL(this.url);
  }

  get name() {
    const name = this.url.split(".")[1] || "";
    const firstLetter = name.charAt(0) || "";
    return `${firstLetter.toUpperCase()}${name.substring(1)}`;
  }
}

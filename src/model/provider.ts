import { PriceParser } from "./price.parser";

export class Provider {
  constructor(
    private _url: string,
    public readonly priceParser: PriceParser,
  ) {}

  get url() {
    return new URL(this._url);
  }

  get name() {
    const name = this._url.split(".")[1] || "";
    const firstLetter = name.charAt(0) || "";
    return `${firstLetter.toUpperCase()}${name.substring(1)}`;
  }
}

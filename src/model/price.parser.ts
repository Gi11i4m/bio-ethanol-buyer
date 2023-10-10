export class PriceParser {
  constructor(private htmlPriceExtrator: (html: string) => string) {}

  getPrice(html) {
    return Number(
      this.htmlPriceExtrator(html).replace(",", ".").replace("€", ""),
    );
  }
}

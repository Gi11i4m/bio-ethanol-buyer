export class PriceParser {
  constructor(private htmlPriceExtrator: (html: string) => string) {}

  getPrice(html: string) {
    return Number(
      this.htmlPriceExtrator(html).replace(",", ".").replace("€", ""),
    );
  }
}

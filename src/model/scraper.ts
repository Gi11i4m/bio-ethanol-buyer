import axios from "axios";
import terminalLink from "terminal-link";
import { ProductData } from "./product.data";
import { Product } from "./product";
import { EMPTY_PRODUCT, EMPTY_PRODUCT_DATA } from "../resources/products";

export class Scraper {
  private productData: ProductData[] = [];

  constructor(private products: Product[]) {}

  get numberOfSources() {
    return this.products.length;
  }

  async fetchBioEthanols(): Promise<void> {
    const prices = await Promise.all<number>(
      this.products.map((product) =>
        axios
          .get(product.urlEncoded)
          .then(({ data }) => product.provider.priceParser.getPrice(data))
          .catch((_) => {
            console.error(
              `Could not get price information for ${terminalLink(
                product.provider.name,
                product.urlEncoded,
              )}`,
            );
            return -1;
          }),
      ),
    );
    this.productData = this.products
      .map(
        (product, index) =>
          new ProductData(
            product,
            prices[index],
            Math.round((prices[index] / product.amount) * 100) / 100,
          ),
      )
      .filter((product) => product.hasPrice);
  }

  get list() {
    return this.productData.sort(
      (bio1, bio2) => bio1.pricePerLiter - bio2.pricePerLiter,
    );
  }

  get mostExpensive() {
    return this.productData.reduce(
      (acc, curr) => (curr.pricePerLiter > acc.pricePerLiter ? curr : acc),
      EMPTY_PRODUCT_DATA,
    );
  }

  get cheapest() {
    return this.productData.reduce(
      (acc, curr) => (curr.pricePerLiter < acc.pricePerLiter ? curr : acc),
      new ProductData(EMPTY_PRODUCT, Infinity, Infinity),
    );
  }
}

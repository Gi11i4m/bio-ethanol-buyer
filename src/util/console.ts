import terminalLink from "terminal-link";
import { ProductData } from "../model/product.data";

export const readableList = (products: ProductData[]) =>
  products.map(
    (productData) =>
      `${terminalLink(
        productData.product.provider.name,
        productData.product.url.toString(),
      )}: €${productData.pricePerLiter}/L (${productData.product.amount}L)`,
  );

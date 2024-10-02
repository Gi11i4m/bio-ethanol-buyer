import terminalLink from "terminal-link";
import { ProductData } from "../model/product.data";

export const readableList = (products: ProductData[]) =>
  products.map(
    (productData) =>
      `${terminalLink(
        productData.product.provider.name,
        productData.product.urlEncoded,
      )}: €${productData.pricePerLiter}/L (${productData.product.amount}L)`,
  );

export function logAndReturn<V>(value: V): V {
  console.log(JSON.stringify(value, undefined, 2));
  return value;
}

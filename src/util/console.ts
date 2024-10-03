import terminalLink from "terminal-link";
import { Row } from "../adapters/storage";

export const readableList = (products: Row[]) =>
  products.map(
    (productData) =>
      `${terminalLink(productData.name, productData.url)}: €${
        productData.pricePerLiter
      }/L (${productData.amount}L)`,
  );

export function logAndReturn<V>(value: V): V {
  console.log(JSON.stringify(value, undefined, 2));
  return value;
}

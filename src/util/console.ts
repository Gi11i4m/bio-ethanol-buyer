import terminalLink from "terminal-link";
import { ProductData } from "../model/product.data";
import { Row } from "../adapter/storage";

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

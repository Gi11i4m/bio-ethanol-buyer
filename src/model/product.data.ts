import { Product } from "./product";

export class ProductData {
  constructor(
    public readonly product: Product,
    private price: number,
    public readonly pricePerLiter: number,
  ) {}

  get hasPrice() {
    return !!this.price && !!this.pricePerLiter && this.pricePerLiter > 0;
  }
}

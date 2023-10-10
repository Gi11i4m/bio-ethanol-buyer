import { Provider } from "./provider";

export class Product {
  constructor(
    public readonly provider: Provider,
    private path: string,
    public readonly amount: number,
  ) {}

  get url() {
    return new URL(this.provider.url.href + this.path);
  }
}

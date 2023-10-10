import { Provider } from "./provider";

export class Product {
  constructor(
    private provider: Provider,
    private url: string,
    private amount: number,
  ) {}

  get url() {
    return new URL(`${this.provider.url}${this.url}`);
  }
}

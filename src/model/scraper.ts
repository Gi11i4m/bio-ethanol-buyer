import axios from "axios";
import terminalLink from "terminal-link";
import { productUrl, providerName } from "./model/bio-ethanols";
import { EMPTY_PROVIDER, Provider } from "./model/providers";

const EMPTY_BIO_ETHANOL: BioEthanol = {
  provider: EMPTY_PROVIDER,
  url: "/placeholder",
  amount: 0,
  price: 0,
  pricePerLiter: 0,
};

export type BioEthanolConfig = {
  provider: Provider;
  url: string;
  amount: number;
};

export type BioEthanol = BioEthanolConfig & {
  price: number;
  pricePerLiter: number;
};

export class Scraper {
  private bioEthanols: BioEthanol[] = [];

  constructor(private bioEthanolConfigs: BioEthanolConfig[]) {}

  get numberOfSources() {
    return this.bioEthanolConfigs.length;
  }

  async fetchBioEthanols(): Promise<void> {
    const prices = await Promise.all<number>(
      this.bioEthanolConfigs.map((bioEthanol) =>
        axios
          .get(productUrl(bioEthanol))
          .then(({ data }) => bioEthanol.provider.priceParser(data))
          .catch((_) => {
            console.error(
              `Could not get price information for ${terminalLink(
                providerName(bioEthanol.provider),
                productUrl(bioEthanol),
              )}`,
            );
            return -1;
          }),
      ),
    );
    this.bioEthanols = this.bioEthanolConfigs
      .map(({ provider, url, amount, ...rest }, index) => ({
        provider,
        url,
        amount,
        ...rest,
        price: prices[index],
        pricePerLiter: Math.round((prices[index] / amount) * 100) / 100,
      }))
      .filter(({ price, pricePerLiter }) => price || pricePerLiter);
  }

  get list() {
    return this.bioEthanols.sort(
      (bio1, bio2) => bio1.pricePerLiter - bio2.pricePerLiter,
    );
  }

  get mostExpensive() {
    return this.bioEthanols.reduce(
      (acc, curr) => (curr.pricePerLiter > acc.pricePerLiter ? curr : acc),
      EMPTY_BIO_ETHANOL,
    );
  }

  get cheapest() {
    return this.bioEthanols.reduce(
      (acc, curr) => (curr.pricePerLiter < acc.pricePerLiter ? curr : acc),
      { ...EMPTY_BIO_ETHANOL, pricePerLiter: Infinity },
    );
  }
}

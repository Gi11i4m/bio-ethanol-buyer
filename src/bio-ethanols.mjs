import axios from "axios";
import { brico, EMPTY_PROVIDER, gamma } from "./providers.mjs";

/**
 * @typedef {Object} BioEthanol
 * @property {import('./providers.mjs').Provider} provider
 * @property {string} url
 * @property {number} amount
 * @property {number} price
 * @property {number} pricePerLiter
 */

/** @type {BioEthanol} */
const EMPTY_BIO_ETHANOL = {
  provider: EMPTY_PROVIDER,
  url: "/placeholder",
  amount: 0,
  price: 0,
  pricePerLiter: 0,
};

const BIO_ETHANOL_CONFIGS = [
  {
    provider: brico,
    url: "badkamer-keuken-wonen/verwarming/brandstoffen/forever-bio-ethanol-20l/5254577",
    amount: 20,
  },
  {
    provider: brico,
    url: "badkamer-keuken-wonen/verwarming/brandstoffen/forever-bio-ethanol-5l/5131316",
    amount: 5,
  },
  {
    provider: gamma,
    url: "assortiment/livin-flame-bio-ethanol-5-l/p/B391275",
    amount: 5,
  },
  {
    provider: gamma,
    url: "assortiment/livin-flame-bio-ethanol-1-l/p/B335087",
    amount: 1,
  },
];

/**
 * @param {BioEthanol} bioEthanol
 * @returns {string} Product URL
 */
export const productUrl = ({ provider, url }) => `${provider.url}${url}`;

export class BioEthanolScraper {
  /** @type {BioEthanol[]} */
  bioEthanols = [];

  /** @type {number} */
  get numberOfSources() {
    return BIO_ETHANOL_CONFIGS.length;
  }

  /** @returns {Promise<void>} */
  async fetchBioEthanols() {
    const prices = await Promise.all(
      BIO_ETHANOL_CONFIGS.map((bioEthanol) =>
        axios
          .get(productUrl(bioEthanol))
          .then(({ data }) => bioEthanol.provider.priceParser(data))
      )
    );
    this.bioEthanols = BIO_ETHANOL_CONFIGS.map(
      ({ provider, url, amount, ...rest }, index) => ({
        provider,
        url,
        amount,
        ...rest,
        price: prices[index],
        pricePerLiter: Math.round((prices[index] / amount) * 100) / 100,
      })
    );
  }

  /** @returns {BioEthanol} */
  getMostExpensive() {
    return this.bioEthanols.reduce(
      (acc, curr) => (curr.pricePerLiter > acc.pricePerLiter ? curr : acc),
      EMPTY_BIO_ETHANOL
    );
  }

  /** @returns {BioEthanol} */
  getCheapest() {
    return this.bioEthanols.reduce(
      (acc, curr) => (curr.pricePerLiter < acc.pricePerLiter ? curr : acc),
      { ...EMPTY_BIO_ETHANOL, pricePerLiter: Infinity }
    );
  }
}

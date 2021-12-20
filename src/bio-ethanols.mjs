import { brico, gamma } from "./providers.mjs";

/**
 * @typedef {Object} BioEthanol
 * @property {BioEthanolProvider} provider
 * @property {string} url
 * @property {number} amount
 */

/** @type BioEthanol[] */
export const bioEthanols = [
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

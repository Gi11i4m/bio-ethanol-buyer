import { JSDOM } from "jsdom";

/**
 * @callback PriceParser
 *
 * @param {string} html
 * @returns {number}
 */

/** @type {PriceParser} */
function metaPriceParser(html) {
  const {
    groups: { price },
  } = html
    .match(/<meta[^\/]*\/>/gm)
    .filter((match) => match.includes('"price"'))[0]
    ?.match(/content="(?<price>.*)"/);
  return Number(price);
}

/** @type {PriceParser} */
function windowProductDetailsFragmentInfoPriceParser(html) {
  const {
    window: {
      __PRELOADED_STATE_productDetailsFragmentInfo__: {
        productDetails: {
          price: { value },
        },
      },
    },
  } = new JSDOM(html, { runScripts: "dangerously" });
  return Number(value);
}

/**
 * @typedef {Object} Provider
 * @property {string} url
 * @property {PriceParser} priceParser
 */

/** @type {Provider} */
export const EMPTY_PROVIDER = {
  url: "https://emp.ty",
  priceParser: () => {},
};

/** @type {Provider} */
export const brico = {
  url: "https://www.brico.be/nl/",
  priceParser: windowProductDetailsFragmentInfoPriceParser,
};

/** @type {Provider} */
export const gamma = {
  url: "https://www.gamma.be/nl/",
  priceParser: metaPriceParser,
};

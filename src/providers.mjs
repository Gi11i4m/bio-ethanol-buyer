/**
 * @param {string} html
 * @returns {number}
 */
function metaPriceParser(html) {
  const {
    groups: { price },
  } = html
    .match(/<meta[^\/]*\/>/gm)
    .filter((match) => match.includes('"price"'))[0]
    ?.match(/content="(?<price>.*)"/);
  return Number(price);
}

/**
 * @typedef {Object} Provider
 * @property {string} url
 * @property {Function} priceParser
 */

/** @type Provider */
export const EMPTY_PROVIDER = {
  url: "https://emp.ty",
  priceParser: () => {},
};

/** @type Provider */
export const brico = {
  url: "https://www.brico.be/nl/",
  priceParser: metaPriceParser,
};

/** @type Provider */
export const gamma = {
  url: "https://www.gamma.be/nl/",
  priceParser: metaPriceParser,
};

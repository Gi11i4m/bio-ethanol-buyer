import axios from "axios";

const STORAGE_URL = "https://jsonbin.org/gi11i4m";

/**
 * @typedef {Object} Price
 * @property {number} highestPPL
 * @property {number} lowestPPL
 * @property {?Date} date
 */

/** @type {Price} */
const EMPTY_PRICE = {
  highestPPL: 0,
  lowestPPL: Infinity,
  date: new Date(),
};

export class Storage {
  /** @param {string} auth */
  constructor(auth) {
    this.http = axios.create({
      baseURL: STORAGE_URL,
      validateStatus: (status) =>
        (status >= 200 && status < 300) || status === 422, // 422 bug, see [here](https://laracasts.com/discuss/channels/laravel/422-unprocessable-entity-when-logging-out-using-axios-headers) ;
    });
    this.http.defaults.headers.common["Authorization"] = auth;
    this.http.defaults.headers.common["Content-Type'"] = "application/json";
  }

  /** @returns {Promise<Price[]>} */
  async getPrices() {
    if (!(await this.http.get("/bio-ethanol")).data.prices) {
      await this.initDb();
    }
    const {
      data: { prices },
    } = await this.http.get("/bio-ethanol");
    return prices.map(({ date, ...rest }) => ({
      date: Date.parse(date),
      ...rest,
    }));
  }

  /** @param {Price} price */
  async addPrice(price) {
    const newPrices = {
      prices: [...(await this.getPrices()), { ...price, date: new Date() }],
    };
    return this.http.post("/bio-ethanol", newPrices);
  }

  async initDb() {
    return this.http.post("/bio-ethanol", { prices: [EMPTY_PRICE] });
  }
}

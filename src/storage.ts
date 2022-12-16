import axios, { Axios } from "axios";

const STORAGE_URL = "https://jsonbin.org/gi11i4m";

interface Price {
  highestPPL: number;
  lowestPPL: number;
  date: Date;
}

const EMPTY_PRICE: Price = {
  highestPPL: 0,
  lowestPPL: Infinity,
  date: new Date(),
};

interface StorageData {
  prices: Price[];
}

export class Storage {
  private http: Axios;

  constructor(auth: string) {
    this.http = axios.create({
      baseURL: STORAGE_URL,
      validateStatus: (status) =>
        (status >= 200 && status < 300) || status === 422, // 422 bug, see [here](https://laracasts.com/discuss/channels/laravel/422-unprocessable-entity-when-logging-out-using-axios-headers) ;
    });
    this.http.defaults.headers.common["Authorization"] = auth;
    this.http.defaults.headers.common["Content-Type'"] = "application/json";
  }

  async getPrices(): Promise<Price[]> {
    if (!(await this.http.get("/bio-ethanol")).data.prices) {
      await this.initDb();
    }
    const {
      data: { prices },
    } = await this.http.get<StorageData>("/bio-ethanol");
    return prices.map(({ date, ...rest }) => ({
      date: new Date(date),
      ...rest,
    }));
  }

  async addPrice(price: Price) {
    const newPrices = {
      prices: [...(await this.getPrices()), { ...price, date: new Date() }],
    };
    return this.http.post("/bio-ethanol", newPrices);
  }

  async initDb() {
    return this.http.post("/bio-ethanol", { prices: [EMPTY_PRICE] });
  }
}

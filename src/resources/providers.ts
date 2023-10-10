import {
  bioEthanolShopPriceParser,
  huboPriceParser,
  infinityPriceParser,
  metaPriceParser,
  promoPriceParser,
} from "./parsers";
import { Provider } from "../model/provider";

export const EMPTY_PROVIDER = new Provider(
  "https://emp.ty",
  infinityPriceParser,
);
export const brico = new Provider("https://www.brico.be/nl/", huboPriceParser);
export const gamma = new Provider("https://www.gamma.be/nl/", metaPriceParser);
export const bol = new Provider("https://www.bol.com/be/nl/", promoPriceParser);
export const hubo = new Provider("https://www.hubo.be/nl/", huboPriceParser);
export const bioEthanolShop = new Provider(
  "https://www.bioethanolshop.nl/",
  bioEthanolShopPriceParser,
);

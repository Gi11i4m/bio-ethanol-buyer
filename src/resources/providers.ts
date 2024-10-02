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
  "",
);
export const brico = new Provider(
  "https://www.brico.be/nl/",
  huboPriceParser,
  `querySelector('span[data-test="productLayoutPrice"]'))?.textContent || ""`,
);
export const gamma = new Provider(
  "https://www.gamma.be/nl/",
  metaPriceParser,
  "querySelector('meta[name=\"price\"]')?.getAttribute('content')",
);
export const bol = new Provider(
  "https://www.bol.com/be/nl/",
  promoPriceParser,
  `querySelector("[data-test='buy-block-sticky-cta-price']")?.innerHTML || ""`,
);
export const hubo = new Provider(
  "https://www.hubo.be/nl/",
  huboPriceParser,
  `querySelector('span[data-test="productLayoutPrice"]'))?.textContent || ""`,
);
export const bioEthanolShop = new Provider(
  "https://www.bioethanolshop.nl/",
  bioEthanolShopPriceParser,
  'querySelector(`*[data-widget_type="wd_single_product_price.default"]`)?.textContent?.trim() || ""',
);

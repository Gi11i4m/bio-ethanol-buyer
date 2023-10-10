import { JSDOM, VirtualConsole } from "jsdom";
import { PriceParser } from "./price.parser";

export const metaPriceParser = new PriceParser(
  (html) =>
    html
      .match(/<meta[^\/]*\/>/gm)!
      .filter((match) => match.includes('"price"'))[0]
      ?.match(/content="(?<price>.*)"/)!.groups!["price"],
);

export const windowProductDetailsFragmentInfoPriceParser = new PriceParser(
  (html) =>
    new JSDOM(html, {
      runScripts: "dangerously",
      virtualConsole: new VirtualConsole(),
    }).window.__PRELOADED_STATE_productDetailsFragmentInfo__.productDetails
      .price.value,
);

export const promoPriceParser = new PriceParser(
  (html) =>
    new JSDOM(html).window.document.querySelector(
      `[data-test='buy-block-sticky-cta-price']`,
    )?.innerHTML,
);

export const offersPriceParser = new PriceParser(
  (html) =>
    Array.from(document.querySelectorAll(`script[type="application/ld+json"]`))
      .map((el) => JSON.parse(el.innerHTML))
      .filter(({ offers }) => !!offers?.price)[0]?.offers.price,
);

export const huboPriceParser = new PriceParser(
  (html) =>
    new JSDOM(html).window.document.querySelector(
      'span[data-test="productLayoutPrice"]',
    )?.textContent,
);

export const bioEthanolShopPriceParser = new PriceParser(
  (html) =>
    new JSDOM(html).window.document
      .querySelector(`*[data-widget_type="wd_single_product_price.default"]`)
      ?.textContent?.trim(),
);

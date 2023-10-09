import { JSDOM, VirtualConsole } from "jsdom";

type PriceParser = (html: string) => number;

const metaPriceParser: PriceParser = (html) => {
  const { groups } = html
    .match(/<meta[^\/]*\/>/gm)!
    .filter((match) => match.includes('"price"'))[0]
    ?.match(/content="(?<price>.*)"/)!;
  return Number(groups!["price"].replace(",", "."));
};

const windowProductDetailsFragmentInfoPriceParser: PriceParser = (html) => {
  const {
    window: {
      __PRELOADED_STATE_productDetailsFragmentInfo__: {
        productDetails: {
          price: { value },
        },
      },
    },
  } = new JSDOM(html, {
    runScripts: "dangerously",
    virtualConsole: new VirtualConsole(),
  });
  return Number(value?.replace(",", "."));
};

const promoPriceParser: PriceParser = (html) => {
  const {
    window: { document },
  } = new JSDOM(html);
  return Number(
    document
      .querySelector(`[data-test='buy-block-sticky-cta-price']`)
      ?.innerHTML.replace(",", "."),
  );
};

const offersPriceParser: PriceParser = (html) =>
  Number(
    Array.from(document.querySelectorAll(`script[type="application/ld+json"]`))
      .map((el) => JSON.parse(el.innerHTML))
      .filter(({ offers }) => !!offers?.price)[0]
      ?.offers.price.replace(",", "."),
  );

const huboPriceParser: PriceParser = (html) => {
  const {
    window: { document },
  } = new JSDOM(html);
  return Number(
    document
      .querySelector('span[data-test="productLayoutPrice"]')
      ?.textContent?.replace(",", "."),
  );
};

const bioEthanolShopPriceParser: PriceParser = (html) => {
  const {
    window: { document },
  } = new JSDOM(html);
  return Number(
    document
      .querySelector(`*[data-widget_type="wd_single_product_price.default"]`)
      ?.textContent?.trim()
      ?.replace("€", "")
      ?.replace(",", "."),
  );
};

export interface Provider {
  url: string;
  priceParser: PriceParser;
}

export const EMPTY_PROVIDER: Provider = {
  url: "https://emp.ty",
  priceParser: (_) => Infinity,
};

export const brico: Provider = {
  url: "https://www.brico.be/nl/",
  priceParser: huboPriceParser,
};

export const gamma: Provider = {
  url: "https://www.gamma.be/nl/",
  priceParser: metaPriceParser,
};

export const bol: Provider = {
  url: "https://www.bol.com/be/nl/",
  priceParser: promoPriceParser,
};

export const hubo: Provider = {
  url: "https://www.hubo.be/nl/",
  priceParser: huboPriceParser,
};

export const bioEthanolShop: Provider = {
  url: "https://www.bioethanolshop.nl/",
  priceParser: bioEthanolShopPriceParser,
};

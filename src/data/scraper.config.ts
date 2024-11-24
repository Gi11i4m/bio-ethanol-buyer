import { ScraperConfig } from "../adapters/scraper";
import { identity, min } from "lodash";

// TODO: simplify and load externally to make scraper fully generic
export const SCRAPER_CONFIG: ScraperConfig = {
  name: "Bio-ethanol scraper",
  notificationFn(previousScrapeResults, results) {
    const minPricePerLiter = (results: any[]) =>
      min(
        results
          .map((res) => res["pricePerLiter"])
          .filter(identity)
          .map(Number),
      );
    const previousMinPricePerLiter = minPricePerLiter(previousScrapeResults);
    const currentMinPricePerLiter = minPricePerLiter(results);
    console.log(previousMinPricePerLiter, currentMinPricePerLiter);
    if (previousMinPricePerLiter !== currentMinPricePerLiter) {
      return `Minimum price per liter has changed from ${previousMinPricePerLiter} to ${currentMinPricePerLiter}`;
    }
    return null;
  },
  websites: [
    {
      baseUrl: "https://www.bioethanolshop.nl",
      productsUrl:
        "https://www.bioethanolshop.nl/product-categorie/bioethanol/kieselgreen-bio-ethanol-96-6/page/{{PAGE}}/?per_page=24",
      itemParser: ({ document }) =>
        Array.from(
          document.querySelectorAll(
            ".product.purchasable.product_tag-bioethanol",
          ),
        ).map((item) => {
          const title = clamp(
            item.querySelector(".wd-entities-title")?.textContent!,
          );
          const price = Number(
            clean(item.querySelector(".price .amount")?.textContent)
              .replace(".", "")
              .replace(",", "."),
          );
          const liters = extractAmountOfLiters(title);
          const pricePerLiter = liters
            ? Math.round((price / liters) * 100) / 100
            : undefined;
          const url = item
            .querySelector(".wd-entities-title a")
            ?.getAttribute("href")!;
          return {
            title,
            pricePerLiter,
            url,
          };
        }),
    },
    // {
    //   baseUrl: "https://www.bol.com",
    //   productsUrl:
    //     "https://www.bol.com/be/nl/s/?page={{PAGE}}&searchtext=bio-ethanol&view=list&N=18273&12194=7-500&rating=all",
    //   itemParser: ({ baseUrl, document }) =>
    //     Array.from(document.querySelectorAll(".product-item--row")).map(
    //       (item) => {
    //         const fullTitle =
    //           clean(
    //             item.querySelector('*[data-test="product-title"]')?.textContent,
    //           ) +
    //           " " +
    //           clean(
    //             item.querySelector('*[data-test="product-specs"]')?.textContent,
    //           );
    //         const title = clamp(fullTitle);
    //         const price = Number(
    //           clean(
    //             item
    //               .querySelector('meta[itemprop="price"]')
    //               ?.getAttribute("content"),
    //           ),
    //         );
    //         const liters = extractAmountOfLiters(fullTitle);
    //         const pricePerLiter = liters
    //           ? Math.round((price / liters) * 100) / 100
    //           : undefined;
    //         const url =
    //           baseUrl +
    //           clean(
    //             item
    //               .querySelector('*[data-test="product-title"]')
    //               ?.getAttribute("href"),
    //           );
    //         return {
    //           title,
    //           pricePerLiter,
    //           url,
    //         };
    //       },
    //     ),
    // },
  ],
};

/** Utility methods for the itemParser to use **/
const TITLE_CUTOFF = 50;

function clean(text: string | null | undefined) {
  return text
    ? text
        .trim()
        .replaceAll("\n", "")
        .replace(/ +(?= )/g, "")
        .replace("€", "")
    : "";
}

function clamp(text: string) {
  return (
    text.substring(0, TITLE_CUTOFF) + (text.length > TITLE_CUTOFF ? "..." : "")
  );
}

function extractAmountOfLiters(text: string): number | undefined {
  const amountTimesLiterRegex =
    /(?<multiplier>\d+)\s?x\s?(?<amount>\d+)\s?liter/im;
  const literPlusLiterRegex =
    /(?<amount1>\d+)\s?\s?\+\s?(?<amount2>\d+)\s?liter/im;
  const literRegex = /(?<amount>\d+)\s?liter/im;

  if (amountTimesLiterRegex.test(text)) {
    const { multiplier, amount } = amountTimesLiterRegex.exec(text)?.groups!;
    const totalAmount = Number(multiplier) * Number(amount);
    if (Number.isFinite(totalAmount)) {
      return totalAmount;
    }
  } else if (literPlusLiterRegex.test(text)) {
    const { amount1, amount2 } = literPlusLiterRegex.exec(text)?.groups!;
    const totalAmount = Number(amount1) + Number(amount2);
    if (Number.isFinite(totalAmount)) {
      return totalAmount;
    }
  } else if (literRegex.test(text)) {
    const { amount } = literRegex.exec(text)?.groups!;
    const totalAmount = Number(amount);
    if (Number.isFinite(totalAmount)) {
      return totalAmount;
    }
  }
}

import { ScraperConfig } from "../adapters/scraper";
import { identity, min } from "lodash";

export const PAGE_MARKER = "{{PAGE}}";

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
      enabled: true,
      productsUrl: `https://www.bioethanolshop.nl/product-categorie/bioethanol/kieselgreen-bio-ethanol-96-6/page/${PAGE_MARKER}/?per_page=24`,
      itemParser: ({ document }) =>
        Array.from(
          document.querySelectorAll(
            ".product.purchasable.product_tag-bioethanol",
          ),
        ).map((item) => {
          const fullTitle =
            item.querySelector(".wd-entities-title")?.textContent!;
          const price = extractAmount(
            item.querySelector(".price .amount")?.textContent,
          );
          const liters = extractAmountOfLiters(fullTitle);
          const pricePerLiter = liters
            ? Math.round((price / liters) * 100) / 100
            : Infinity;
          const url = item
            .querySelector(".wd-entities-title a")
            ?.getAttribute("href")!;
          return {
            title: clamp(fullTitle),
            pricePerLiter,
            url,
          };
        }),
    },
    {
      baseUrl: "https://www.brico.be/nl",
      enabled: true,
      productsUrl:
        "https://www.brico.be/nl/search?text=bio-ethanol&group_id=he014&filterKeys=group_id",
      itemParser: ({ document, baseUrl }) =>
        Array.from(
          document.querySelectorAll(`*[data-class="product-card"]`),
        ).map((item) => {
          const fullTitle = item.querySelector(`*[data-testid="card-title"]`)
            ?.textContent!;
          const pricePerLiter = extractAmount(
            item
              .querySelector(`.lstr-va3s15`)
              ?.textContent?.replace("per L", ""),
          );
          const url = baseUrl + item.parentElement?.getAttribute("href")!;
          return {
            title: clamp(fullTitle),
            pricePerLiter,
            url,
          };
        }),
    },
    {
      baseUrl: "https://www.bol.com",
      enabled: true,
      productsUrl: `https://www.bol.com/be/nl/s/?page=${PAGE_MARKER}&searchtext=bio-ethanol&view=list&N=18273&12194=7-500&rating=all`,
      itemParser: ({ baseUrl, document }) =>
        Array.from(document.querySelectorAll(".product-item--row")).map(
          (item) => {
            const fullTitle =
              clean(
                item.querySelector('*[data-test="product-title"]')?.textContent,
              ) +
              " " +
              clean(
                item.querySelector('*[data-test="product-specs"]')?.textContent,
              );
            const title = clamp(fullTitle);
            const price = Number(
              clean(
                item
                  .querySelector('meta[itemprop="price"]')
                  ?.getAttribute("content"),
              ),
            );
            const liters = extractAmountOfLiters(fullTitle);
            const pricePerLiter = liters
              ? Math.round((price / liters) * 100) / 100
              : Infinity;
            const url =
              baseUrl +
              clean(
                item
                  .querySelector('*[data-test="product-title"]')
                  ?.getAttribute("href"),
              );
            return {
              title,
              pricePerLiter,
              url,
            };
          },
        ),
    },
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
  const literRegex = /(?<amount>\d+)\s?(liter|L)/im;

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

function extractAmount(text: string | null | undefined) {
  return text
    ? Number(clean(text.replaceAll(".", "").replace(",", ".").replace("€", "")))
    : Infinity;
}

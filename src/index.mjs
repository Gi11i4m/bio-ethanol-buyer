import axios from "axios";
import { existsSync, readFileSync, appendFileSync, writeFileSync } from "fs";
import { bioEthanols, productUrl } from "./bio-ethanols.mjs";

await (async () => {
  console.log(
    `🔥 Scraping bio-ethanol prices from ${bioEthanols.length} sources...`
  );

  const prices = await Promise.all(
    bioEthanols.map((bioEthanol) =>
      axios
        .get(productUrl(bioEthanol))
        .then(({ data }) => bioEthanol.provider.priceParser(data))
    )
  );

  const bioEthanolsWithPriceInfo = bioEthanols.map(
    ({ provider, url, amount, ...rest }, index) => ({
      provider,
      url,
      amount,
      ...rest,
      price: prices[index],
      pricePerLiter: Math.round((prices[index] / amount) * 100) / 100,
    })
  );

  /** @type import('./bio-ethanols.mjs').BioEthanol */
  const highest = bioEthanolsWithPriceInfo.reduce(
    (acc, curr) => (curr.pricePerLiter > acc.pricePerLiter ? curr : acc),
    {
      provider: { url: "https://emp.ty" },
      url: "/placeholder",
      pricePerLiter: 0,
    }
  );
  console.log(
    `📈 Highest price per liter is ${highest.pricePerLiter} at ${productUrl(
      highest
    )}`
  );

  /** @type import('./bio-ethanols.mjs').BioEthanol */
  const lowest = bioEthanolsWithPriceInfo.reduce(
    (acc, curr) => (curr.pricePerLiter < acc.pricePerLiter ? curr : acc),
    { provider: { url: "https://emp.ty" }, pricePerLiter: Infinity }
  );
  console.log(
    `📉 Lowest price per liter is ${lowest.pricePerLiter} at ${productUrl(
      lowest
    )}`
  );

  const priceFileName = "prices.json";
  const mailFileName = "mail.md";

  if (existsSync(priceFileName)) {
    console.log(`♻️ Comparing to previous prices`);
    const { highestPPL, lowestPPL } = JSON.parse(readFileSync(priceFileName));
    if (
      highest.pricePerLiter > highestPPL ||
      lowest.pricePerLiter < lowestPPL
    ) {
      console.log(`📬 New prices found, writing e-mail`);
      if (highest.pricePerLiter > highestPPL) {
        appendFileSync(
          mailFileName,
          `[New highest price per liter: ${highest.pricePerLiter}](${productUrl(
            highest
          )})  
`
        );
      }
      if (lowest.pricePerLiter < lowestPPL) {
        appendFileSync(
          mailFileName,
          `[New lowest price per liter: ${lowest.pricePerLiter}](${productUrl(
            lowest
          )})  
`
        );
      }
    } else {
      console.log(`🚫 No new prices found`);
    }
  }

  console.log(`💾 Saving highest and lowest prices in ${priceFileName}`);
  writeFileSync(
    priceFileName,
    JSON.stringify({
      highestPPL: highest.pricePerLiter,
      lowestPPL: lowest.pricePerLiter,
    })
  );
})();

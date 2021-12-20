import axios from "axios";
import { bioEthanols } from "./bio-ethanols.mjs";

await (async () => {
  console.log(
    `🔥 Scraping bio-ethanol prices from ${bioEthanols.length} sources...`
  );

  const prices = await Promise.all(
    bioEthanols.map(({ provider, url }) =>
      axios
        .get(`${provider.url}${url}`)
        .then(({ data }) => provider.priceParser(data))
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

  const highestPPLP = bioEthanolsWithPriceInfo.reduce(
    (acc, curr) => (curr.pricePerLiter > acc.pricePerLiter ? curr : acc),
    {
      provider: { url: "https://emp.ty" },
      url: "/placeholder",
      pricePerLiter: 0,
    }
  );
  console.log(
    `📈 Highest price per liter is ${highestPPLP.pricePerLiter} at ${highestPPLP.provider.url}${highestPPLP.url}`
  );

  const lowestPPLP = bioEthanolsWithPriceInfo.reduce(
    (acc, curr) => (curr.pricePerLiter < acc.pricePerLiter ? curr : acc),
    { provider: { url: "https://emp.ty" }, pricePerLiter: Infinity }
  );
  console.log(
    `📉 Lowest price per liter is ${lowestPPLP.pricePerLiter} at ${lowestPPLP.provider.url}${lowestPPLP.url}`
  );
})();

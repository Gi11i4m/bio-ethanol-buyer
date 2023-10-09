import axios from "axios";
import terminalLink from "terminal-link";
import {
  bioEthanolShop,
  bol,
  brico,
  EMPTY_PROVIDER,
  gamma,
  hubo,
  Provider,
} from "./providers";

interface BioEthanol {
  provider: Provider;
  url: string;
  amount: number;
  price: number;
  pricePerLiter: number;
}

type BioEthanolConfig = Omit<BioEthanol, "price" | "pricePerLiter">;

const EMPTY_BIO_ETHANOL: BioEthanol = {
  provider: EMPTY_PROVIDER,
  url: "/placeholder",
  amount: 0,
  price: 0,
  pricePerLiter: 0,
};

const BIO_ETHANOL_CONFIGS: BioEthanolConfig[] = [
  {
    provider: brico,
    url: "badkamer-keuken-wonen/verwarming/brandstoffen/forever-bio-ethanol-20l/5254577",
    amount: 20,
  },
  {
    provider: brico,
    url: "badkamer-keuken-wonen/verwarming/brandstoffen/forever-bio-ethanol-5l/5131316",
    amount: 5,
  },
  {
    provider: gamma,
    url: "assortiment/livin-flame-bio-ethanol-5-l/p/B391275",
    amount: 5,
  },
  {
    provider: gamma,
    url: "assortiment/livin-flame-bio-ethanol-1-l/p/B335087",
    amount: 1,
  },
  {
    provider: bol,
    url: "p/bio-ethanol-100-zuiverheid-biofair-bioethanol-schone-verbranding-reukloos-1-liter/9300000080112268",
    amount: 1,
  },
  {
    provider: bol,
    url: "p/bio-ethanol-100-zuiverheid-biofair-bioethanol-schone-verbranding-reukloos-2-5-liter-cannister/9300000082256479",
    amount: 2.5,
  },
  {
    provider: bol,
    url: "p/bio-ethanol-100-zuiverheid-biofair-bioethanol-schone-verbranding-reukloos-5-liter-cannister/9300000082258588",
    amount: 5,
  },
  {
    provider: bol,
    url: "p/bio-ethanol-100-zuiverheid-biofair-bioethanol-schone-verbranding-reukloos-10-liter-cannister/9300000082257456",
    amount: 10,
  },
  {
    provider: bol,
    url: "p/bio-ethanol-100-zuiverheid-biofair-bioethanol-schone-verbranding-reukloos-20-liter-cannister/9300000082257233",
    amount: 20,
  },
  {
    provider: bol,
    url: "p/premium-bio-ethanol-bio-ethanol-96-6-biobrandstof-12x1-liter/9300000020687110",
    amount: 12,
  },
  {
    provider: bol,
    url: "p/biobranderhaard-bol-com-aanbieding-premium-kwaliteit-bio-ethanol-12-flessen-bio-ethanol-voor-sfeerhaarden-geurloos-milieuvriendelijk-premium-kwaliteit-bio-ethanolhaard-vulling-sfeerhaarden-bio-ethanol-sfeerhaardvulling/9300000020689630",
    amount: 12,
  },
  {
    provider: hubo,
    url: "p/forever-bio-ethanol-5l/224302",
    amount: 5,
  },
  {
    provider: bioEthanolShop,
    url: "product/kieselgreen-5-liter-96-6-premium-bio-ethanol-voor-sfeerhaarden-in-jerrycan/",
    amount: 5,
  },
  {
    provider: bioEthanolShop,
    url: "product/kieselgreen-5-liter-96-6-premium-bioethanol-voor-sfeerhaarden-in-jerrycan-met-dopkraan/",
    amount: 5,
  },
  {
    provider: bioEthanolShop,
    url: "product/5-liter-bio-ethanol-bioethanol-100-zuivere-ethanol/",
    amount: 5,
  },
  {
    provider: bioEthanolShop,
    url: "product/bio-ethanol-10-liter-bioethanol-100-biobrandstof-in-jerrycan/",
    amount: 10,
  },
  {
    provider: bioEthanolShop,
    url: "product/kieselgreen-bioethanol-1-liter-bio-ethanol-966-biobrandstof-in-literfles/",
    amount: 1,
  },
  {
    provider: bioEthanolShop,
    url: "product/kynast-bio-ethanol-1-liter-bioethanol-966-biobrandstof-in-literfles/",
    amount: 1,
  },
  {
    provider: bioEthanolShop,
    url: "product/kynast-bio-ethanol-6-liter-bioethanol-966-biobrandstof-in-literfles/",
    amount: 6,
  },
  {
    provider: bioEthanolShop,
    url: "product/10-liter-biofair-geproduceerde-bio-ethanol-966-geleverd-in-jerrycan/",
    amount: 10,
  },
  {
    provider: bioEthanolShop,
    url: "product/kieselgreen-20-liter-100-bio-ethanol-gedenatureerde-bioethanol-in-2-jerrycans/",
    amount: 20,
  },
  {
    provider: bioEthanolShop,
    url: "product/kieselgreen-bio-ethanol-12-liter-966-geurloos-biobrandstof-in-literfles-bioethanol-voor-sfeerhaard/",
    amount: 12,
  },
  {
    provider: bioEthanolShop,
    url: "product/kynast-bio-ethanol-12-liter-bioethanol-966-biobrandstof-in-literfles/",
    amount: 12,
  },
  {
    provider: bioEthanolShop,
    url: "product/bio-ethanol-20-liter-bioethanol-966-biobrandstof-in-jerrycan/",
    amount: 20,
  },
  {
    provider: bioEthanolShop,
    url: "product/kieselgreen-30-liter-100-bio-ethanol-gedenatureerde-bioethanol-in-3-jerrycans/",
    amount: 30,
  },
  {
    provider: bioEthanolShop,
    url: "product/bio-ethanol-30-liter-bioethanol-966-biobrandstof-in-jerrycan/",
    amount: 30,
  },
  {
    provider: bioEthanolShop,
    url: "product/kieselgreen-60-liter-100-bio-ethanol-gedenatureerde-bioethanol-in-6-jerrycans/",
    amount: 60,
  },
  {
    provider: bioEthanolShop,
    url: "product/kieselgreen-90-liter-100-bio-ethanol-gedenatureerde-bioethanol-in-9-jerrycans/",
    amount: 90,
  },
  {
    provider: bioEthanolShop,
    url: "product/kieselgreen-120-liter-100-bio-ethanol-gedenatureerde-bioethanol-in-12-jerrycans/",
    amount: 120,
  },
  {
    provider: bioEthanolShop,
    url: "product/bio-ethanol-60-liter-bioethanol-966-biobrandstof-in-jerrycan/",
    amount: 60,
  },
  {
    provider: bioEthanolShop,
    url: "product/bio-ethanol-90-liter-bioethanol-966-biobrandstof-in-jerrycan/",
    amount: 90,
  },
  {
    provider: bioEthanolShop,
    url: "product/bio-ethanol-120-liter-bioethanol-966-biobrandstof-in-jerrycan/",
    amount: 120,
  },
];

export const productUrl = ({
  provider,
  url,
}: Pick<BioEthanolConfig, "provider" | "url">) => `${provider.url}${url}`;

export const providerName = ({ url }: Provider) => {
  const name = url.split(".")[1] || "";
  const firstLetter = name.charAt(0) || "";
  return `${firstLetter.toUpperCase()}${name.substring(1)}`;
};

export const readableList = (bioEthanols: BioEthanol[]) =>
  bioEthanols.map(
    ({ provider, amount, pricePerLiter, url }) =>
      `${terminalLink(
        providerName(provider),
        productUrl({ provider, url }),
      )}: €${pricePerLiter}/L (${amount}L)`,
  );

export class BioEthanolScraper {
  bioEthanols: BioEthanol[] = [];

  get numberOfSources() {
    return BIO_ETHANOL_CONFIGS.length;
  }

  async fetchBioEthanols(): Promise<void> {
    const prices = await Promise.all<number>(
      BIO_ETHANOL_CONFIGS.map((bioEthanol) =>
        axios
          .get(productUrl(bioEthanol))
          .then(({ data }) => bioEthanol.provider.priceParser(data))
          .catch((_) => {
            console.error(
              `Could not get price information for ${terminalLink(
                providerName(bioEthanol.provider),
                productUrl(bioEthanol),
              )}`,
            );
            return -1;
          }),
      ),
    );
    this.bioEthanols = BIO_ETHANOL_CONFIGS.map(
      ({ provider, url, amount, ...rest }, index) => ({
        provider,
        url,
        amount,
        ...rest,
        price: prices[index],
        pricePerLiter: Math.round((prices[index] / amount) * 100) / 100,
      }),
    ).filter(({ price, pricePerLiter }) => price || pricePerLiter);
  }

  get list() {
    return this.bioEthanols.sort(
      (bio1, bio2) => bio1.pricePerLiter - bio2.pricePerLiter,
    );
  }

  get mostExpensive() {
    return this.bioEthanols.reduce(
      (acc, curr) => (curr.pricePerLiter > acc.pricePerLiter ? curr : acc),
      EMPTY_BIO_ETHANOL,
    );
  }

  get cheapest() {
    return this.bioEthanols.reduce(
      (acc, curr) => (curr.pricePerLiter < acc.pricePerLiter ? curr : acc),
      { ...EMPTY_BIO_ETHANOL, pricePerLiter: Infinity },
    );
  }
}

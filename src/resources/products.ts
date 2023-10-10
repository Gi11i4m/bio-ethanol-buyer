import {
  bioEthanolShop,
  bol,
  brico,
  EMPTY_PROVIDER,
  gamma,
  hubo,
} from "./providers";
import { Product } from "../model/product";
import { ProductData } from "../model/product.data";

export const EMPTY_PRODUCT = new Product(EMPTY_PROVIDER, "/", 0);

export const EMPTY_PRODUCT_DATA = new ProductData(EMPTY_PRODUCT, 0, 0);

export const PRODUCTS: Product[] = [
  new Product(
    brico,
    "/badkamer-keuken-wonen/verwarming/brandstoffen/forever-bio-ethanol-20l/5254577",
    20,
  ),
  new Product(
    brico,
    "/badkamer-keuken-wonen/verwarming/brandstoffen/forever-bio-ethanol-5l/5131316",
    5,
  ),
  new Product(gamma, "assortiment/livin-flame-bio-ethanol-5-l/p/B391275", 5),
  new Product(gamma, "assortiment/livin-flame-bio-ethanol-1-l/p/B335087", 1),
  new Product(
    bol,
    "p/bio-ethanol-100-zuiverheid-biofair-bioethanol-schone-verbranding-reukloos-1-liter/9300000080112268",
    1,
  ),
  new Product(
    bol,
    "p/bio-ethanol-100-zuiverheid-biofair-bioethanol-schone-verbranding-reukloos-2-5-liter-cannister/9300000082256479",
    2.5,
  ),
  new Product(
    bol,
    "p/bio-ethanol-100-zuiverheid-biofair-bioethanol-schone-verbranding-reukloos-5-liter-cannister/9300000082258588",
    5,
  ),
  new Product(
    bol,
    "p/bio-ethanol-100-zuiverheid-biofair-bioethanol-schone-verbranding-reukloos-10-liter-cannister/9300000082257456",
    10,
  ),
  new Product(
    bol,
    "p/bio-ethanol-100-zuiverheid-biofair-bioethanol-schone-verbranding-reukloos-20-liter-cannister/9300000082257233",
    20,
  ),
  new Product(
    bol,
    "p/premium-bio-ethanol-bio-ethanol-96-6-biobrandstof-12x1-liter/9300000020687110",
    12,
  ),
  new Product(
    bol,
    "p/biobranderhaard-bol-com-aanbieding-premium-kwaliteit-bio-ethanol-12-flessen-bio-ethanol-voor-sfeerhaarden-geurloos-milieuvriendelijk-premium-kwaliteit-bio-ethanolhaard-vulling-sfeerhaarden-bio-ethanol-sfeerhaardvulling/9300000020689630",
    12,
  ),
  new Product(hubo, "p/forever-bio-ethanol-5l/224302", 5),
  new Product(
    bioEthanolShop,
    "product/kieselgreen-5-liter-96-6-premium-bio-ethanol-voor-sfeerhaarden-in-jerrycan/",
    5,
  ),
  new Product(
    bioEthanolShop,
    "product/kieselgreen-5-liter-96-6-premium-bioethanol-voor-sfeerhaarden-in-jerrycan-met-dopkraan/",
    5,
  ),
  new Product(
    bioEthanolShop,
    "product/5-liter-bio-ethanol-bioethanol-100-zuivere-ethanol/",
    5,
  ),
  new Product(
    bioEthanolShop,
    "product/bio-ethanol-10-liter-bioethanol-100-biobrandstof-in-jerrycan/",
    10,
  ),
  new Product(
    bioEthanolShop,
    "product/kieselgreen-bioethanol-1-liter-bio-ethanol-966-biobrandstof-in-literfles/",
    1,
  ),
  new Product(
    bioEthanolShop,
    "product/kynast-bio-ethanol-1-liter-bioethanol-966-biobrandstof-in-literfles/",
    1,
  ),
  new Product(
    bioEthanolShop,
    "product/kynast-bio-ethanol-6-liter-bioethanol-966-biobrandstof-in-literfles/",
    6,
  ),
  new Product(
    bioEthanolShop,
    "product/10-liter-biofair-geproduceerde-bio-ethanol-966-geleverd-in-jerrycan/",
    10,
  ),
  new Product(
    bioEthanolShop,
    "product/kieselgreen-20-liter-100-bio-ethanol-gedenatureerde-bioethanol-in-2-jerrycans/",
    20,
  ),
  new Product(
    bioEthanolShop,
    "product/kieselgreen-bio-ethanol-12-liter-966-geurloos-biobrandstof-in-literfles-bioethanol-voor-sfeerhaard/",
    12,
  ),
  new Product(
    bioEthanolShop,
    "product/kynast-bio-ethanol-12-liter-bioethanol-966-biobrandstof-in-literfles/",
    12,
  ),
  new Product(
    bioEthanolShop,
    "product/bio-ethanol-20-liter-bioethanol-966-biobrandstof-in-jerrycan/",
    20,
  ),
  new Product(
    bioEthanolShop,
    "product/kieselgreen-30-liter-100-bio-ethanol-gedenatureerde-bioethanol-in-3-jerrycans/",
    30,
  ),
  new Product(
    bioEthanolShop,
    "product/bio-ethanol-30-liter-bioethanol-966-biobrandstof-in-jerrycan/",
    30,
  ),
  new Product(
    bioEthanolShop,
    "product/kieselgreen-60-liter-100-bio-ethanol-gedenatureerde-bioethanol-in-6-jerrycans/",
    60,
  ),
  new Product(
    bioEthanolShop,
    "product/kieselgreen-90-liter-100-bio-ethanol-gedenatureerde-bioethanol-in-9-jerrycans/",
    90,
  ),
  new Product(
    bioEthanolShop,
    "product/kieselgreen-120-liter-100-bio-ethanol-gedenatureerde-bioethanol-in-12-jerrycans/",
    120,
  ),
  new Product(
    bioEthanolShop,
    "product/bio-ethanol-60-liter-bioethanol-966-biobrandstof-in-jerrycan/",
    60,
  ),
  new Product(
    bioEthanolShop,
    "product/bio-ethanol-90-liter-bioethanol-966-biobrandstof-in-jerrycan/",
    90,
  ),
  new Product(
    bioEthanolShop,
    "product/bio-ethanol-120-liter-bioethanol-966-biobrandstof-in-jerrycan/",
    120,
  ),
];

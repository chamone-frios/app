export enum ProductMetric {
  UNIT = 0,
  KG = 1,
  G = 2,
  L = 3,
}

export type Product = {
  id: string;
  name: string;
  img: string;
  description: string;
  maker: string;
  metric: ProductMetric;
  stock: number;
  price: number;
};

export type GetProductsResponse = {
  products: Product[];
};

export type GetProductResponse = {
  product: Product;
};

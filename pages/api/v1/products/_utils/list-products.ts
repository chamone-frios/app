import { NextApiResponse } from "next";
import { getProducts } from "../_database/get-products";

const listProducts = async (res: NextApiResponse): Promise<void> => {
  try {
    const products = await getProducts();
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export { listProducts };

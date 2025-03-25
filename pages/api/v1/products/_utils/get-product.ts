import { NextApiResponse } from "next";
import { getProduct } from "../_database/get-products";

const getProductById = async (id: string, res: NextApiResponse) => {
  try {
    const product = await getProduct({ id });
    res.status(200).json({ product });
  } catch (error) {
    res.status(404).json({ error: "Product not found" });
  }
};

export { getProductById };

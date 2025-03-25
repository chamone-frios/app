import { NextApiResponse } from "next";
import { deleteProduct } from "../_database/delete-products";

const deleteProductById = async (id: string, res: NextApiResponse) => {
  try {
    const product = await deleteProduct({ id });
    res.status(200).json({ product });
  } catch (error) {
    res.status(404).json({ error: "Product not found" });
  }
};

export { deleteProductById };

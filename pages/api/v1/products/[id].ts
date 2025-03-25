import { NextApiRequest, NextApiResponse } from "next";
import { getProductById } from "./_utils/get-product";
import { updateProductById } from "./_utils/update-product";
import { deleteProductById } from "./_utils/delete-product";

const productHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (!id || Array.isArray(id))
    return res.status(400).json({ error: "ID inválido" });

  if (req.method === "GET") return getProductById(id, res);

  if (req.method === "PATCH") return updateProductById(id, req, res);

  if (req.method === "DELETE") return deleteProductById(id, res);

  return res.status(405).json({
    error: "Method not allowed",
  });
};

export default productHandler;

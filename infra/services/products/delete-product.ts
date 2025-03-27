import { deleteProduct } from 'infra/database';
import { NextApiResponse } from 'next';

const deleteProductById = async (id: string, res: NextApiResponse) => {
  try {
    const product = await deleteProduct({ id });
    res.status(200).json({ product });
  } catch (error) {
    res.status(404).json({ error: 'Product not found', details: error });
  }
};

export { deleteProductById };

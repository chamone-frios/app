import { NextApiResponse } from 'next';

import { getProducts } from 'src/backend/database';

const listProducts = async (res: NextApiResponse): Promise<void> => {
  try {
    const products = await getProducts();
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products', details: error });
  }
};

export { listProducts };

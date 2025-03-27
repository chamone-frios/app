import { NextApiRequest, NextApiResponse } from 'next';

import { createProduct, listProducts } from 'src/backend/services';

const products = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') return createProduct(req, res);

  if (req.method === 'GET') return listProducts(res);

  return res.status(405).json({
    error: 'Method not allowed',
  });
};

export default products;

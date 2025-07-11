import { NextApiRequest, NextApiResponse } from 'next';

import { createOrder, listOrders } from 'src/backend/services';

const orders = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') return createOrder(req, res);
  if (req.method === 'GET') return listOrders(res);

  return res.status(405).json({
    error: 'Method not allowed',
  });
};

export default orders;

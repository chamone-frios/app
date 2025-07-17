import { NextApiRequest, NextApiResponse } from 'next';

import { getClientOrders } from 'src/backend/services';

const clientOrdersHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { id } = req.query;

  if (!id || typeof id !== 'string')
    return res.status(400).json({ error: 'invalid ID' });

  if (req.method === 'GET') return getClientOrders(id, res);

  return res.status(405).json({
    error: 'Method not allowed',
  });
};

export default clientOrdersHandler;

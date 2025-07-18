import { NextApiRequest, NextApiResponse } from 'next';

import { getOrderById } from 'src/backend/services';

const orderHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (!id || typeof id !== 'string')
    return res.status(400).json({ error: 'invalid ID' });

  if (req.method === 'GET') return getOrderById(id, res);

  return res.status(405).json({
    error: 'Method not allowed',
  });
};

export default orderHandler;

import { NextApiRequest, NextApiResponse } from 'next';

import { updateOrderStatus } from 'src/backend/services';
import { OrderStatus } from 'src/constants/types';

const OrderStatusHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { status } = req.body;
  const { id } = req.query;

  if (!id || typeof id !== 'string')
    return res.status(400).json({ error: 'invalid ID' });

  if (!status || Object.values(OrderStatus).includes(status) === false)
    return res.status(400).json({ error: 'invalid status' });

  if (req.method === 'POST') return updateOrderStatus(id, status, res);

  return res.status(405).json({
    error: 'Method not allowed',
  });
};

export default OrderStatusHandler;

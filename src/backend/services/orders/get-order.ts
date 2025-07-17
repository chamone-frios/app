import { NextApiResponse } from 'next';

import { getOrder } from 'src/backend/database';

const getOrderById = async (id: string, res: NextApiResponse) => {
  try {
    const order = await getOrder({ id });
    res.status(200).json({ order });
  } catch (error) {
    res.status(404).json({ error: 'Order not found', details: error });
  }
};

export { getOrderById };

import { NextApiResponse } from 'next';

import { deleteOrder } from 'src/backend/database';

const deleteOrderById = async (id: string, res: NextApiResponse) => {
  try {
    const order = await deleteOrder({ id });
    res.status(200).json({ order });
  } catch (error) {
    res.status(404).json({ error: 'Order not found', details: error });
  }
};

export { deleteOrderById };

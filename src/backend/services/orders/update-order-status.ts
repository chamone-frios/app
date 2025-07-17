import { NextApiResponse } from 'next';

import { updateOrderStatus as updateStatusOnDB } from 'src/backend/database';
import { OrderStatus } from 'src/constants/types';

const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  res: NextApiResponse
) => {
  try {
    await updateStatusOnDB(orderId, status);
    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
    });
  } catch (error) {
    if (error) {
      res.status(404).json({ error: 'Order not found', details: error });
    } else {
      res
        .status(500)
        .json({ error: 'Failed to update order status', details: error });
    }
  }
};

export { updateOrderStatus };

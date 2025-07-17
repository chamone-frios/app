import { OrderStatus } from 'src/constants/types';
import { query } from 'src/integrations/database';

const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<void> => {
  const sql = `
    UPDATE orders
    SET status = $1
    WHERE id = $2
    RETURNING *;
  `;

  const values = [status, orderId];

  try {
    const result = await query({ text: sql, values });

    if (!result.rows || result.rows.length === 0) {
      throw new Error(`Order [${orderId}] not found`);
    }
  } catch (error) {
    console.error('[Source orders.ts@updateOrderStatus()]', error);
    throw error;
  }
};

export { updateOrderStatus };

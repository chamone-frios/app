import { query } from 'src/integrations/database';

const deleteOrder = async ({ id }: { id: string }): Promise<null> => {
  const sql = `
    DELETE FROM orders
    WHERE id = $1;
  `;

  try {
    await query({ text: sql, values: [id] });
    return null;
  } catch (error) {
    console.error('[Source orders.ts@deleteOrder()]', error);
    throw error;
  }
};

export { deleteOrder };

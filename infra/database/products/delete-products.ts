import { query } from 'infra/database';

const deleteProduct = async ({ id }: { id: string }): Promise<null> => {
  const sql = `
    DELETE FROM products
    WHERE id = $1;
  `;

  try {
    await query({ text: sql, values: [id] });
    return null;
  } catch (error) {
    console.error('[Source products.ts@deleteProduct()]', error);
    throw error;
  }
};

export { deleteProduct };

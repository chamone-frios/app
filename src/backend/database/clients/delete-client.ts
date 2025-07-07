import { query } from 'src/integrations/database';

const deleteClient = async ({ id }: { id: string }): Promise<null> => {
  const sql = `
    DELETE FROM clients
    WHERE id = $1;
  `;

  try {
    await query({ text: sql, values: [id] });
    return null;
  } catch (error) {
    console.error('[Source clients.ts@deleteClient()]', error);
    throw error;
  }
};

export { deleteClient };

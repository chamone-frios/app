import { Client } from 'src/constants/types';
import { query } from 'src/integrations/database';

type UpdateClient = {
  id: string;
  client: Omit<Client, 'id'>;
};

const updateClient = async ({ id, client }: UpdateClient): Promise<string> => {
  const { name, establishment_type, phone, maps_link } = client;

  const sql = `
    UPDATE clients
    SET name = $1, establishment_type = $2, phone = $3, maps_link = $4
    WHERE id = $5
    RETURNING *;
  `;

  const values = [name, establishment_type, phone, maps_link, id];

  try {
    const result = await query({ text: sql, values });

    if (!result.rows || result.rows.length === 0)
      throw new Error(`Client [${id}] not found`);

    return id;
  } catch (error) {
    console.error('[Source clients.ts@updateClient()]', error);
    throw error;
  }
};

export { updateClient };

import { Client } from 'src/constants/types';
import { query } from 'src/integrations/database';
import { v4 as uuidv4 } from 'uuid';

type InsertClientInput = Omit<Client, 'id'>;

const insertClient = async (client: InsertClientInput): Promise<string> => {
  const id = uuidv4();
  const { name, establishment_type, phone, maps_link } = client;

  const sql = `
    INSERT INTO clients (id, name, establishment_type, phone, maps_link, created_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING *;
  `;

  const values = [id, name, establishment_type, phone, maps_link];

  try {
    await query({ text: sql, values });
    return id;
  } catch (error) {
    console.error('[Source clients.ts@insertClient()]', error);
    throw error;
  }
};

export { insertClient };

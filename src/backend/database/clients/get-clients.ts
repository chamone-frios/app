import { Client } from 'src/constants/types';
import { query } from 'src/integrations/database';

const getClient = async ({ id }: { id: string }): Promise<Client> => {
  const queryString = `
    SELECT id, name, establishment_type, phone, maps_link, created_at
    FROM clients
    WHERE id = $1
  `;

  try {
    const result = await query({ text: queryString, values: [id] });

    if (!result.rows || result.rows.length === 0)
      throw new Error(`Client [${id}] not found`);

    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      establishment_type: row.establishment_type,
      phone: row.phone,
      maps_link: row.maps_link,
    };
  } catch (error) {
    console.error(
      `[Source get-clients.ts@getClient()] Error fetching client ${id}:`,
      error
    );
    throw error;
  }
};

const getClients = async (): Promise<Client[]> => {
  const queryString = `
    SELECT id, name, establishment_type, phone, maps_link
    FROM clients
    ORDER BY name ASC
  `;

  try {
    const { rows } = await query(queryString);
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      establishment_type: row.establishment_type,
      phone: row.phone,
      maps_link: row.maps_link,
    }));
  } catch (error) {
    console.error(
      '[Source get-clients.ts@getClients()] Error fetching clients:',
      error
    );
    throw error;
  }
};

export { getClient, getClients };

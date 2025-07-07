import { NextApiResponse } from 'next';

import { deleteClient } from 'src/backend/database';

const deleteClientById = async (id: string, res: NextApiResponse) => {
  try {
    const client = await deleteClient({ id });
    res.status(200).json({ client });
  } catch (error) {
    res.status(404).json({ error: 'Client not found', details: error });
  }
};

export { deleteClientById };

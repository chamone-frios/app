import { NextApiResponse } from 'next';

import { getClient } from 'src/backend/database';

const getClientById = async (id: string, res: NextApiResponse) => {
  try {
    const client = await getClient({ id });
    res.status(200).json({ client });
  } catch (error) {
    res.status(404).json({ error: 'Client not found', details: error });
  }
};

export { getClientById };

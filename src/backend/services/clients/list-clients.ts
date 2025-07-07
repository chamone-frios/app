import { NextApiResponse } from 'next';

import { getClients } from 'src/backend/database';

const listClients = async (res: NextApiResponse): Promise<void> => {
  try {
    const clients = await getClients();
    res.status(200).json({ clients });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clients', details: error });
  }
};

export { listClients };

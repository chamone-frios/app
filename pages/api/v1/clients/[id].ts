import { NextApiRequest, NextApiResponse } from 'next';

import {
  getClientById,
  updateClientById,
  deleteClientById,
} from 'src/backend/services';

const clientHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (!id || Array.isArray(id))
    return res.status(400).json({ error: 'invalid ID' });

  if (req.method === 'GET') return getClientById(id, res);

  if (req.method === 'PATCH') return updateClientById(id, req, res);

  if (req.method === 'DELETE') return deleteClientById(id, res);

  return res.status(405).json({
    error: 'Method not allowed',
  });
};

export default clientHandler;

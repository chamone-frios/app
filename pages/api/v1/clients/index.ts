import { NextApiRequest, NextApiResponse } from 'next';

import { createClient, listClients } from 'src/backend/services';

const clients = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') return createClient(req, res);

  if (req.method === 'GET') return listClients(res);

  return res.status(405).json({
    error: 'Method not allowed',
  });
};

export default clients;

import { NextApiRequest, NextApiResponse } from 'next';

import { getReceipt } from 'src/backend/services';

const ReceiptHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (!id || typeof id !== 'string')
    return res.status(400).json({ error: 'invalid ID' });

  if (req.method === 'GET') return getReceipt(id, res);

  return res.status(405).json({
    error: 'Method not allowed',
  });
};

export default ReceiptHandler;

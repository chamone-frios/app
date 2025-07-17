import { NextApiResponse } from 'next';

import { getClient, getOrdersByClientId } from 'src/backend/database';

const getClientOrders = async (client_id: string, res: NextApiResponse) => {
  try {
    await getClient({ id: client_id });

    const orders = await getOrdersByClientId({ client_id });
    res.status(200).json({ orders });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ error: 'Client not found', details: error });
    } else {
      res
        .status(500)
        .json({ error: 'Failed to fetch client orders', details: error });
    }
  }
};

export { getClientOrders };

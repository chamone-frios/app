import { NextApiResponse } from 'next';

import { getOrders } from 'src/backend/database';

const listOrders = async (res: NextApiResponse): Promise<void> => {
  try {
    const orders = await getOrders();
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders', details: error });
  }
};

export { listOrders };

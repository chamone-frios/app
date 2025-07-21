import { NextApiRequest, NextApiResponse } from 'next';

import { insertOrder } from 'src/backend/database';
import { CreateOrderRequest } from 'src/constants/types';

const createOrder = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const body: CreateOrderRequest = req.body;

    if (!body.client_id) {
      return res.status(400).json({
        error: 'Missing required field: client_id',
      });
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return res.status(400).json({
        error: 'Missing required field: items (must be a non-empty array)',
      });
    }

    for (let i = 0; i < body.items.length; i++) {
      const item = body.items[i];

      if (!item.product_id) {
        return res.status(400).json({
          error: `Missing product_id for item at index ${i}`,
        });
      }

      if (
        !item.quantity ||
        typeof item.quantity !== 'number' ||
        item.quantity <= 0
      ) {
        return res.status(400).json({
          error: `Invalid quantity for item at index ${i} (must be a positive number)`,
        });
      }
    }

    if (body.discount !== undefined) {
      if (
        typeof body.discount !== 'number' ||
        body.discount < 0 ||
        !Number.isFinite(body.discount)
      ) {
        return res.status(400).json({
          error:
            'Invalid discount value (must be a non-negative finite number)',
        });
      }
    }

    if (body.tax !== undefined) {
      if (
        typeof body.tax !== 'number' ||
        body.tax < 0 ||
        !Number.isFinite(body.tax)
      ) {
        return res.status(400).json({
          error: 'Invalid tax value (must be a non-negative finite number)',
        });
      }
    }

    if (body.notes !== undefined && typeof body.notes !== 'string') {
      return res.status(400).json({
        error: 'Invalid notes value (must be a string)',
      });
    }

    const orderId = await insertOrder({
      client_id: body.client_id,
      items: body.items,
      discount: body.discount || 0,
      tax: body.tax || 0,
      notes: body.notes,
    });

    return res.status(201).json({
      success: true,
      id: orderId,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes('Client') &&
        error.message.includes('not found')
      ) {
        return res.status(404).json({
          error: error.message,
        });
      }

      if (
        error.message.includes('Product') &&
        error.message.includes('not found')
      ) {
        return res.status(404).json({
          error: error.message,
        });
      }

      if (error.message.includes('Insufficient stock')) {
        return res.status(400).json({
          error: error.message,
        });
      }
    }

    return res.status(500).json({
      error: 'An error occurred while creating the order',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

export { createOrder };

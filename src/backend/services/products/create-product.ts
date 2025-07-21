import { NextApiRequest, NextApiResponse } from 'next';

import { insertProduct } from 'src/backend/database';
import { ProductMetric } from 'src/constants/types';

const createProduct = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const body = req.body;
    if (
      !body.name ||
      !body.img ||
      !body.description ||
      !body.maker ||
      body.metric === undefined ||
      body.stock === undefined ||
      body.price === undefined
    ) {
      return res.status(400).json({
        error: 'Missing required fields',
      });
    }

    if (!(body.metric in ProductMetric)) {
      return res.status(400).json({
        error: 'Invalid metric value',
      });
    }

    if (typeof body.stock !== 'number' || body.stock < 0) {
      return res.status(400).json({
        error: 'Stock must be a non-negative number',
      });
    }

    if (typeof body.price !== 'number' || body.price <= 0) {
      return res.status(400).json({
        error: 'Price must be a positive number',
      });
    }

    if (body.purchase_price !== undefined) {
      if (typeof body.purchase_price !== 'number' || body.purchase_price < 0) {
        return res.status(400).json({
          error: 'Purchase price must be a non-negative number',
        });
      }

      if (body.purchase_price >= body.price) {
        return res.status(400).json({
          error: 'Sale price must be greater than purchase price',
        });
      }
    }

    const productId = await insertProduct({
      name: body.name,
      img: body.img,
      description: body.description,
      maker: body.maker,
      metric: body.metric,
      stock: body.stock,
      price: body.price,
      purchase_price: body.purchase_price,
    });

    return res.status(201).json({
      success: true,
      id: productId,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'An error occurred while creating the product',
      details: error,
    });
  }
};

export { createProduct };

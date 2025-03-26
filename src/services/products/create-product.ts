import { NextApiRequest, NextApiResponse } from 'next';
import { ProductMetric } from 'src/constants/types';
import { insertProduct } from 'src/database';

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

    const productId = await insertProduct({
      name: body.name,
      img: body.img,
      description: body.description,
      maker: body.maker,
      metric: body.metric,
      stock: body.stock,
      price: body.price,
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

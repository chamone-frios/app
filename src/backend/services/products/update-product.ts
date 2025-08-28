import { NextApiRequest, NextApiResponse } from 'next';

import { updateProduct } from 'src/backend/database';
import { ProductMetric } from 'src/constants/types';

const updateProductById = async (
  id: string,
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const product = req.body;

    if (!product)
      return res.status(400).json({ error: 'Product not received' });

    const validationErrors = [];

    if (!product.name || typeof product.name !== 'string')
      validationErrors.push('Name must be a text');

    if (!product.description || typeof product.description !== 'string')
      validationErrors.push('Description must be a text');

    if (!product.maker || typeof product.maker !== 'string')
      validationErrors.push('Maker must be a text');

    if (
      (!product.label && product.label !== 0) ||
      typeof product.label !== 'number'
    )
      validationErrors.push('Label must be a number');

    const validMetrics = Object.values(ProductMetric);
    if (product.metric === undefined || !validMetrics.includes(product.metric))
      validationErrors.push(
        `Metric must be one of: ${validMetrics.join(', ')}`
      );

    if (
      product.stock === undefined ||
      typeof product.stock !== 'number' ||
      product.stock < 0
    )
      validationErrors.push('Stock must be a non-negative number');

    if (
      product.price === undefined ||
      typeof product.price !== 'number' ||
      product.price <= 0
    )
      validationErrors.push('Price must be a positive number');

    if (product.purchase_price !== undefined) {
      if (
        typeof product.purchase_price !== 'number' ||
        product.purchase_price < 0
      ) {
        validationErrors.push('Purchase price must be a non-negative number');
      }

      if (product.purchase_price >= product.price) {
        validationErrors.push('Sale price must be greater than purchase price');
      }
    }

    if (validationErrors.length > 0)
      return res.status(400).json({
        error: 'Invalid data',
        details: validationErrors,
      });

    const updatedProductId = await updateProduct({
      id,
      product: {
        name: product.name,
        img: product.img,
        description: product.description,
        maker: product.maker,
        metric: product.metric,
        stock: product.stock,
        price: product.price,
        label: product.label,
        purchase_price: product.purchase_price,
      },
    });

    return res.status(200).json({ id: updatedProductId });
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Failed to update product', details: error });
  }
};

export { updateProductById };

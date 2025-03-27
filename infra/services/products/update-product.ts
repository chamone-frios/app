import { ProductMetric } from 'infra/constants/types';
import { updateProduct } from 'infra/database';
import { NextApiRequest, NextApiResponse } from 'next';

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

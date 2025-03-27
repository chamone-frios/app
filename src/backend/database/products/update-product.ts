import { Product, ProductMetric } from 'src/constants/types';
import { query } from 'src/integrations/database';

type UpdateProduct = {
  id: string;
  product: Omit<Product, 'id'>;
};

const updateProduct = async ({
  id,
  product,
}: UpdateProduct): Promise<string> => {
  const { name, img, description, maker, metric, stock, price } = product;
  const metricString = ProductMetric[metric].toLowerCase();

  const sql = `
    UPDATE products
    SET name = $1, img = $2, description = $3, maker = $4, metric = $5, stock = $6, price = $7
    WHERE id = $8
    RETURNING *;
  `;

  const values = [
    name,
    img,
    description,
    maker,
    metricString,
    stock,
    price,
    id,
  ];

  try {
    const result = await query({ text: sql, values });

    if (!result.rows || result.rows.length === 0)
      throw new Error(`Product [${id}] not found`);

    return id;
  } catch (error) {
    console.error('[Source products.ts@updateProduct()]', error);
    throw error;
  }
};

export { updateProduct };

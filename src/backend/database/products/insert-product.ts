import { Product, ProductMetric } from 'src/constants/types';
import { query } from 'src/integrations/database';
import { v4 as uuidv4 } from 'uuid';

type InsertProductInput = Omit<Product, 'id' | 'profit_margin'>;

const insertProduct = async (product: InsertProductInput): Promise<string> => {
  const id = uuidv4();
  const {
    name,
    img,
    description,
    maker,
    metric,
    stock,
    price,
    label,
    purchase_price,
  } = product;

  const metricName = ProductMetric[metric as number].toLowerCase();

  const sql = `
    INSERT INTO products (
      id,
      name,
      img,
      description,
      maker,
      metric,
      stock,
      price,
      label,
      purchase_price,
      created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
    RETURNING *;
  `;

  const values = [
    id,
    name,
    img,
    description,
    maker,
    metricName,
    stock,
    price,
    label,
    purchase_price,
  ];

  try {
    await query({ text: sql, values });
    return id;
  } catch (error) {
    console.error('[Source products.ts@insertProduct()]', error);
    throw error;
  }
};

export { insertProduct };

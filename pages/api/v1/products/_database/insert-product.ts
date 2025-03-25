import { query } from "infra/database";
import { v4 as uuidv4 } from "uuid";
import { Product, ProductMetric } from "../_constants/types";

type InsertProductInput = Omit<Product, "id">;

const insertProduct = async (product: InsertProductInput): Promise<string> => {
  const id = uuidv4();
  const { name, img, description, maker, metric, stock, price } = product;

  const metricName = ProductMetric[metric as number].toLowerCase();

  const sql = `
    INSERT INTO products (id, name, img, description, maker, metric, stock, price, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    RETURNING *;
  `;

  const values = [id, name, img, description, maker, metricName, stock, price];

  try {
    await query({ text: sql, values });
    return id;
  } catch (error) {
    console.error("[Source products.ts@insertProduct()]", error);
    throw error;
  }
};

export { insertProduct };

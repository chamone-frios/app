import { Product, ProductMetric } from 'src/constants/types';
import { query } from 'src/integrations/database';

const getProduct = async ({ id }: { id: string }): Promise<Product> => {
  const queryString = `
    SELECT id, name, img, description, maker, metric, stock, price
    FROM products
    WHERE id = $1
  `;

  try {
    const result = await query({ text: queryString, values: [id] });

    if (!result.rows || result.rows.length === 0)
      throw new Error(`Product [${id}] not found`);

    const row = result.rows[0];
    const metric = (
      row.metric as string
    ).toUpperCase() as keyof typeof ProductMetric;
    return {
      id: row.id,
      name: row.name,
      img: row.img,
      description: row.description,
      maker: row.maker,
      metric: ProductMetric[metric],
      stock: row.stock,
      price: parseFloat(row.price),
    };
  } catch (error) {
    console.error(
      `[Source get-products.ts@getProduct()] Error fetching product ${id}:`,
      error
    );
    throw error;
  }
};

const getProducts = async (): Promise<Product[]> => {
  const queryString = `
    SELECT id, name, img, description, maker, metric, stock, price
    FROM products
    ORDER BY name ASC
  `;

  try {
    const { rows } = await query(queryString);
    return rows.map((row) => {
      const metric = (
        row.metric as string
      ).toUpperCase() as keyof typeof ProductMetric;

      return {
        id: row.id,
        name: row.name,
        img: row.img,
        description: row.description,
        maker: row.maker,
        metric: ProductMetric[metric],
        stock: row.stock,
        price: parseFloat(row.price),
      };
    });
  } catch (error) {
    console.error(
      '[Source get-products.ts@getProducts()] Error fetching products:',
      error
    );
    throw error;
  }
};

export { getProduct, getProducts };

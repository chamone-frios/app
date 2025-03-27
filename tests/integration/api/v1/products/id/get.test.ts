import { clearDatabase, runMigrations } from 'tests/utils';

import {
  Product,
  ProductMetric,
} from '../../../../../../infra/constants/types';

describe('GET /api/v1/products/[id]', () => {
  let createdProductId: string;

  beforeAll(async () => {
    await clearDatabase();
    await runMigrations();

    const productToCreate: Omit<Product, 'id'> = {
      name: 'Test Product Get By ID',
      img: 'test-get-by-id.jpg',
      description: 'Product for testing get by ID',
      maker: 'Test Maker',
      metric: ProductMetric.UNIT,
      stock: 10,
      price: 99.99,
    };

    const createResponse = await fetch(
      'http://localhost:3000/api/v1/products',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productToCreate),
      }
    );

    const createData = await createResponse.json();
    createdProductId = createData.id;
  });

  afterAll(async () => {
    await clearDatabase().then(async () => await runMigrations());
  });

  it("should return 404 when product doesn't exist", async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const response = await fetch(
      `http://localhost:3000/api/v1/products/${nonExistentId}`
    );

    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Product not found');
  });

  it('should return the specific product when a valid ID is provided', async () => {
    const response = await fetch(
      `http://localhost:3000/api/v1/products/${createdProductId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('product');
    expect(data.product).toHaveProperty('id');
    expect(data.product.id).toBe(createdProductId);
  });

  it('should return the correct product structure', async () => {
    const response = await fetch(
      `http://localhost:3000/api/v1/products/${createdProductId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    const product = data.product;

    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('img');
    expect(product).toHaveProperty('description');
    expect(product).toHaveProperty('maker');
    expect(product).toHaveProperty('metric');
    expect(product).toHaveProperty('stock');
    expect(product).toHaveProperty('price');

    expect(typeof product.id).toBe('string');
    expect(typeof product.name).toBe('string');
    expect(typeof product.img).toBe('string');
    expect(typeof product.description).toBe('string');
    expect(typeof product.maker).toBe('string');
    expect(typeof product.metric).toBe('number');
    expect(typeof product.stock).toBe('number');
    expect(typeof product.price).toBe('number');
  });

  it('should handle method not allowed', async () => {
    const response = await fetch(
      `http://localhost:3000/api/v1/products/${createdProductId}`,
      { method: 'PUT' }
    );

    expect(response.status).toBe(405);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Method not allowed');
  });
});

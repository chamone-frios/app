import { waitForAllServices } from 'tests/orchestrator';
import { getApiEndpoint } from 'tests/utils';

import { Product, ProductMetric } from '../../../../../../src/constants/types';

describe('GET /api/v1/products/[id]', () => {
  let createdProductId: string;
  let createdProductWithProfitId: string;
  const apiUrl = getApiEndpoint();

  beforeAll(async () => {
    await waitForAllServices();

    const productToCreate: Omit<Product, 'id' | 'profit_margin'> = {
      name: 'Test Product Get By ID',
      img: 'test-get-by-id.jpg',
      description: 'Product for testing get by ID',
      maker: 'Test Maker',
      metric: ProductMetric.UNIT,
      stock: 10.5,
      price: 99.99,
      purchase_price: 50,
    };

    const createResponse = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productToCreate),
    });

    const createData = await createResponse.json();
    createdProductId = createData.id;

    const productWithProfit: Omit<Product, 'id' | 'profit_margin'> = {
      name: 'Test Product With Profit',
      img: 'test-profit.jpg',
      description: 'Product for testing profit calculation',
      maker: 'Profit Maker',
      metric: ProductMetric.KG,
      stock: 25.75,
      price: 50.0,
      purchase_price: 30.0,
    };

    const createProfitResponse = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productWithProfit),
    });

    const createProfitData = await createProfitResponse.json();
    createdProductWithProfitId = createProfitData.id;
  });

  it("should return 404 when product doesn't exist", async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const response = await fetch(`${apiUrl}/api/v1/products/${nonExistentId}`);

    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Product not found');
  });

  it('should return the specific product when a valid ID is provided', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('product');
    expect(data.product).toHaveProperty('id');
    expect(data.product.id).toBe(createdProductId);
  });

  it('should return the correct product structure with all fields', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductId}`
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

    expect(product).toHaveProperty('purchase_price');
    expect(product).toHaveProperty('profit_margin');

    expect(typeof product.id).toBe('string');
    expect(typeof product.name).toBe('string');
    expect(typeof product.img).toBe('string');
    expect(typeof product.description).toBe('string');
    expect(typeof product.maker).toBe('string');
    expect(typeof product.metric).toBe('number');
    expect(typeof product.stock).toBe('number');
    expect(typeof product.price).toBe('number');

    if (product.purchase_price !== undefined) {
      expect(typeof product.purchase_price).toBe('number');
    }
    if (product.profit_margin !== undefined) {
      expect(typeof product.profit_margin).toBe('number');
    }
  });

  it('should support decimal values in stock field', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    const product = data.product;

    expect(product.stock).toBe(10.5);
    expect(typeof product.stock).toBe('number');
  });

  it('should return product with profit calculation when purchase_price is provided', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductWithProfitId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    const product = data.product;

    expect(product.purchase_price).toBe(30.0);
    expect(product.price).toBe(50.0);
    expect(product.profit_margin).toBe(20.0);
    expect(product.stock).toBe(25.75);
  });

  it('should handle products without purchase_price correctly', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    const product = data.product;

    expect(product.purchase_price).toBe(50);
    expect(product.profit_margin).toBe(49.99);
  });

  it('should return correct values from updated database schema', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductWithProfitId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    const product = data.product;

    expect(Number.isFinite(product.stock)).toBe(true);
    expect(Number.isFinite(product.price)).toBe(true);
    expect(Number.isFinite(product.purchase_price)).toBe(true);
    expect(Number.isFinite(product.profit_margin)).toBe(true);

    expect(product.stock.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
    expect(product.price.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
  });

  it('should validate profit_margin calculation consistency', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductWithProfitId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    const product = data.product;

    const expectedProfit = product.price - product.purchase_price;
    expect(product.profit_margin).toBeCloseTo(expectedProfit, 2);
  });

  it('should handle method not allowed', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductId}`,
      { method: 'PUT' }
    );

    expect(response.status).toBe(405);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Method not allowed');
  });

  it('should handle invalid UUID format', async () => {
    const invalidId = 'invalid-uuid-format';
    const response = await fetch(`${apiUrl}/api/v1/products/${invalidId}`);

    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Product not found');
  });

  it('should return consistent data types for all numeric fields', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductWithProfitId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    const product = data.product;

    expect(typeof product.stock).toBe('number');
    expect(typeof product.price).toBe('number');
    expect(typeof product.purchase_price).toBe('number');
    expect(typeof product.profit_margin).toBe('number');

    expect(product.stock).not.toBeNull();
    expect(product.price).not.toBeNull();
    expect(product.purchase_price).not.toBeNull();
    expect(product.profit_margin).not.toBeNull();
  });
});

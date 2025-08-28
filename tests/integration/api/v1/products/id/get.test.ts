import { waitForAllServices } from 'tests/orchestrator';
import { getApiEndpoint } from 'tests/utils';

import {
  Product,
  ProductMetric,
  ProductLabel,
} from '../../../../../../src/constants/types';

describe('GET /api/v1/products/[id]', () => {
  let createdProductId: string;
  let createdProductWithProfitId: string;
  let createdProductWithLabelId: string;
  const apiUrl = getApiEndpoint();

  beforeAll(async () => {
    await waitForAllServices();

    const productToCreate: Omit<Product, 'id' | 'profit_margin'> = {
      name: 'Test Product Get By ID',
      img: 'test-get-by-id.jpg',
      description: 'Product for testing get by ID',
      maker: 'Test Maker',
      metric: ProductMetric.UNIT,
      label: ProductLabel.DAIRY,
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
      label: ProductLabel.MEATS,
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

    const productWithLabel: Omit<Product, 'id' | 'profit_margin'> = {
      name: 'Test Product With Label',
      img: 'test-label.jpg',
      description: 'Product for testing label functionality',
      maker: 'Label Maker',
      metric: ProductMetric.L,
      label: ProductLabel.HAMBURGERS,
      stock: 15.0,
      price: 35.0,
      purchase_price: 20.0,
    };

    const createLabelResponse = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productWithLabel),
    });

    const createLabelData = await createLabelResponse.json();
    createdProductWithLabelId = createLabelData.id;
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
    expect(data.product.label).toBe(ProductLabel.DAIRY);
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
    expect(product).toHaveProperty('label');
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

    if (product.label !== undefined) {
      expect(typeof product.label).toBe('number');
      expect(Object.values(ProductLabel)).toContain(product.label);
    }

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
    expect(product.label).toBe(ProductLabel.DAIRY);
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
    expect(product.label).toBe(ProductLabel.MEATS);
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
    expect(product.label).toBe(ProductLabel.DAIRY);
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
    expect(product.label).toBe(ProductLabel.MEATS);
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
    expect(product.label).toBe(ProductLabel.MEATS);
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
    expect(product.label).toBe(ProductLabel.MEATS);
  });

  it('should return product with 3 decimal places precision in stock field', async () => {
    const productWith3Decimals: Omit<Product, 'id' | 'profit_margin'> = {
      name: 'Test Product 3 Decimals Get ID',
      img: 'three-decimals-get-id.jpg',
      description: 'Product with 3 decimal places for get by ID test',
      maker: 'Decimal Get ID Maker',
      metric: ProductMetric.G,
      label: ProductLabel.PROCESSED,
      stock: 7.875,
      price: 40.0,
      purchase_price: 25.0,
    };

    const createResponse = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productWith3Decimals),
    });

    const createData = await createResponse.json();
    const productId = createData.id;

    const response = await fetch(`${apiUrl}/api/v1/products/${productId}`);

    expect(response.status).toBe(200);

    const data = await response.json();
    const product = data.product;

    expect(product.stock).toBe(7.875);
    expect(typeof product.stock).toBe('number');
    expect(product.stock.toString()).toMatch(/^\d+\.\d{3}$/);
    expect(product.label).toBe(ProductLabel.PROCESSED);

    const stockStr = product.stock.toString();
    const decimalPart = stockStr.split('.')[1];
    expect(decimalPart).toBeDefined();
    expect(decimalPart.length).toBe(3);

    expect(Number.isFinite(product.stock)).toBe(true);
    expect(product.stock).toBeCloseTo(7.875, 3);
  });

  it('should return product with specific label category', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductWithLabelId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    const product = data.product;

    expect(product.label).toBe(ProductLabel.HAMBURGERS);
    expect(product.name).toBe('Test Product With Label');
    expect(product.maker).toBe('Label Maker');
    expect(product.price).toBe(35.0);
    expect(product.purchase_price).toBe(20.0);
    expect(product.profit_margin).toBe(15.0);
  });

  it('should handle products with different label categories', async () => {
    const testCases = [
      {
        label: ProductLabel.DAIRY,
        name: 'Test DAIRY Product By ID',
        expectedLabel: ProductLabel.DAIRY,
      },
      {
        label: ProductLabel.MEATS,
        name: 'Test MEATS Product By ID',
        expectedLabel: ProductLabel.MEATS,
      },
      {
        label: ProductLabel.HAMBURGERS,
        name: 'Test HAMBURGERS Product By ID',
        expectedLabel: ProductLabel.HAMBURGERS,
      },
      {
        label: ProductLabel.PROCESSED,
        name: 'Test PROCESSED Product By ID',
        expectedLabel: ProductLabel.PROCESSED,
      },
    ];

    for (const testCase of testCases) {
      const productData: Omit<Product, 'id' | 'profit_margin'> = {
        name: testCase.name,
        img: `${testCase.label}-test.jpg`,
        description: `Testing ${ProductLabel[testCase.label]} category by ID`,
        maker: `${ProductLabel[testCase.label]} Maker`,
        metric: ProductMetric.UNIT,
        label: testCase.label,
        stock: 10.0,
        price: 50.0,
        purchase_price: 30.0,
      };

      const createResponse = await fetch(`${apiUrl}/api/v1/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      const createData = await createResponse.json();
      const productId = createData.id;

      const response = await fetch(`${apiUrl}/api/v1/products/${productId}`);

      expect(response.status).toBe(200);

      const data = await response.json();
      const product = data.product;

      expect(product.label).toBe(testCase.expectedLabel);
      expect(product.name).toBe(testCase.name);
      expect(typeof product.label).toBe('number');
      expect(Object.values(ProductLabel)).toContain(product.label);
    }
  });

  it('should validate label values are within ProductLabel enum range', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductWithLabelId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    const product = data.product;

    if (product.label !== undefined) {
      expect(typeof product.label).toBe('number');
      expect(product.label).toBeGreaterThanOrEqual(0);
      expect(product.label).toBeLessThanOrEqual(3);
      expect(Object.values(ProductLabel)).toContain(product.label);
    }
  });

  it('should return consistent label data across multiple requests', async () => {
    const promises = Array(3)
      .fill(null)
      .map(() =>
        fetch(`${apiUrl}/api/v1/products/${createdProductWithLabelId}`)
      );

    const responses = await Promise.all(promises);

    responses.forEach((response) => {
      expect(response.status).toBe(200);
    });

    const dataArray = await Promise.all(
      responses.map((response) => response.json())
    );

    const firstLabel = dataArray[0].product.label;
    dataArray.forEach((data) => {
      expect(data.product.label).toBe(firstLabel);
      expect(data.product.label).toBe(ProductLabel.HAMBURGERS);
    });
  });

  it('should handle label field alongside all other product fields', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductWithLabelId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    const product = data.product;

    expect(product.id).toBeDefined();
    expect(product.name).toBe('Test Product With Label');
    expect(product.img).toBe('test-label.jpg');
    expect(product.description).toBe('Product for testing label functionality');
    expect(product.maker).toBe('Label Maker');
    expect(product.metric).toBe(ProductMetric.L);
    expect(product.stock).toBe(15.0);
    expect(product.price).toBe(35.0);
    expect(product.purchase_price).toBe(20.0);
    expect(product.profit_margin).toBe(15.0);

    expect(product.label).toBe(ProductLabel.HAMBURGERS);
    expect(product.label).toBe(2);
  });

  it('should preserve label value from database correctly', async () => {
    const labelTestCases = [
      { label: ProductLabel.DAIRY, expected: 0 },
      { label: ProductLabel.MEATS, expected: 1 },
      { label: ProductLabel.HAMBURGERS, expected: 2 },
      { label: ProductLabel.PROCESSED, expected: 3 },
    ];

    for (const testCase of labelTestCases) {
      const productData: Omit<Product, 'id' | 'profit_margin'> = {
        name: `DB Label Test ${testCase.expected}`,
        img: 'db-label-test.jpg',
        description: 'Testing database label preservation',
        maker: 'DB Test Maker',
        metric: ProductMetric.UNIT,
        label: testCase.label,
        stock: 5.0,
        price: 25.0,
        purchase_price: 15.0,
      };

      const createResponse = await fetch(`${apiUrl}/api/v1/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      const createData = await createResponse.json();
      const productId = createData.id;

      const response = await fetch(`${apiUrl}/api/v1/products/${productId}`);
      const data = await response.json();
      const product = data.product;

      expect(product.label).toBe(testCase.expected);
      expect(product.label).toBe(testCase.label);
    }
  });
});

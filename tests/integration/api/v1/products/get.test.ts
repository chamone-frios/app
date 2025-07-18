import { waitForAllServices } from 'tests/orchestrator';
import { getApiEndpoint } from 'tests/utils';

import { Product, ProductMetric } from '../../../../../src/constants/types';

describe('GET /api/v1/products', () => {
  const apiUrl = getApiEndpoint();

  beforeAll(async () => {
    await waitForAllServices();
  });

  it('should return an empty array when no products exist', async () => {
    const response = await fetch(`${apiUrl}/api/v1/products`);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('products');
    expect(Array.isArray(data.products)).toBe(true);
    expect(data.products.length).toBe(0);
  });

  it('should return all products when products exist', async () => {
    const productsToCreate: Omit<Product, 'id' | 'profit_margin'>[] = [
      {
        name: 'Test Product 1',
        img: 'test-image-1.jpg',
        description: 'First test product',
        maker: 'Test Maker',
        metric: ProductMetric.UNIT,
        stock: 10.5,
        price: 100.5,
      },
      {
        name: 'Test Product 2',
        img: 'test-image-2.jpg',
        description: 'Second test product',
        maker: 'Another Maker',
        metric: ProductMetric.KG,
        stock: 5.75,
        price: 100.0,
        purchase_price: 70.0,
      },
      {
        name: 'Test Product 3',
        img: 'test-image-3.jpg',
        description: 'Third test product',
        maker: 'Yet Another Maker',
        metric: ProductMetric.L,
        stock: 20.25,
        price: 200.99,
        purchase_price: 150.5,
      },
    ];

    const createdProductIds = [];

    for (const product of productsToCreate) {
      const createResponse = await fetch(`${apiUrl}/api/v1/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });

      expect(createResponse.status).toBe(201);

      const createData = await createResponse.json();
      expect(createData.success).toBe(true);
      expect(createData.id).toBeDefined();

      createdProductIds.push(createData.id);
    }

    const response = await fetch(`${apiUrl}/api/v1/products`);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('products');
    expect(Array.isArray(data.products)).toBe(true);
    expect(data.products.length).toBeGreaterThanOrEqual(
      productsToCreate.length
    );

    for (let i = 0; i < createdProductIds.length; i++) {
      const foundProduct = data.products.find(
        (p: Product) => p.id === createdProductIds[i]
      );
      expect(foundProduct).toBeDefined();
      expect(foundProduct.name).toBe(productsToCreate[i].name);
      expect(foundProduct.description).toBe(productsToCreate[i].description);
      expect(foundProduct.maker).toBe(productsToCreate[i].maker);
      expect(foundProduct.stock).toBe(productsToCreate[i].stock);
      expect(foundProduct.img).toBe(productsToCreate[i].img);
      expect(foundProduct.price).toBe(productsToCreate[i].price);

      if (productsToCreate[i].purchase_price !== undefined) {
        expect(foundProduct.purchase_price).toBe(
          productsToCreate[i].purchase_price
        );

        const expectedProfit =
          productsToCreate[i].price - productsToCreate[i].purchase_price!;
        expect(foundProduct.profit_margin).toBeCloseTo(expectedProfit, 2);
      }
    }
  });

  it('should return the correct product structure with all fields', async () => {
    const response = await fetch(`${apiUrl}/api/v1/products`);

    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data.products.length).toBeGreaterThan(0);

    const product = data.products[0];

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
    const response = await fetch(`${apiUrl}/api/v1/products`);

    expect(response.status).toBe(200);

    const data = await response.json();

    const productWithDecimalStock = data.products.find(
      (p: Product) => p.stock % 1 !== 0
    );

    if (productWithDecimalStock) {
      expect(typeof productWithDecimalStock.stock).toBe('number');
      expect(productWithDecimalStock.stock).toBeGreaterThan(0);

      expect(productWithDecimalStock.stock.toString()).toMatch(/^\d+\.\d+$/);
    }
  });

  it('should return products with profit calculation when purchase_price is available', async () => {
    const response = await fetch(`${apiUrl}/api/v1/products`);

    expect(response.status).toBe(200);

    const data = await response.json();

    const productsWithPurchasePrice = data.products.filter(
      (p: Product) => p.purchase_price !== undefined && p.purchase_price > 0
    );

    if (productsWithPurchasePrice.length > 0) {
      productsWithPurchasePrice.forEach((product: Product) => {
        const expectedProfit = product.price - product.purchase_price!;
        expect(product.profit_margin).toBeCloseTo(expectedProfit, 2);

        expect(product.purchase_price).toBeGreaterThan(0);
        expect(product.price).toBeGreaterThan(product.purchase_price!);
        expect(product.profit_margin).toBeGreaterThan(0);
      });
    }
  });

  it('should handle products without purchase_price correctly', async () => {
    const response = await fetch(`${apiUrl}/api/v1/products`);

    expect(response.status).toBe(200);

    const data = await response.json();

    const productsWithoutPurchasePrice = data.products.filter(
      (p: Product) => p.purchase_price === undefined || p.purchase_price === 0
    );

    if (productsWithoutPurchasePrice.length > 0) {
      productsWithoutPurchasePrice.forEach((product: Product) => {
        expect(
          product.profit_margin === undefined || product.profit_margin === 0
        ).toBe(true);
      });
    }
  });

  it('should return products ordered by name ASC', async () => {
    const response = await fetch(`${apiUrl}/api/v1/products`);

    expect(response.status).toBe(200);

    const data = await response.json();

    if (data.products.length > 1) {
      for (let i = 1; i < data.products.length; i++) {
        const currentName = data.products[i].name.toLowerCase();
        const previousName = data.products[i - 1].name.toLowerCase();

        expect(currentName >= previousName).toBe(true);
      }
    }
  });

  it('should return consistent numeric precision for decimal fields', async () => {
    const response = await fetch(`${apiUrl}/api/v1/products`);

    expect(response.status).toBe(200);

    const data = await response.json();

    data.products.forEach((product: Product) => {
      expect(Number.isFinite(product.stock)).toBe(true);
      expect(Number.isFinite(product.price)).toBe(true);

      if (product.purchase_price !== undefined) {
        expect(Number.isFinite(product.purchase_price)).toBe(true);
      }

      if (product.profit_margin !== undefined) {
        expect(Number.isFinite(product.profit_margin)).toBe(true);
      }

      expect(product.stock.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
      expect(product.price.toString()).toMatch(/^\d+(\.\d{1,2})?$/);

      if (product.purchase_price !== undefined && product.purchase_price > 0) {
        expect(product.purchase_price.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
      }
    });
  });

  it('should validate profit_margin calculation consistency across all products', async () => {
    const response = await fetch(`${apiUrl}/api/v1/products`);

    expect(response.status).toBe(200);

    const data = await response.json();

    data.products.forEach((product: Product) => {
      if (
        product.purchase_price &&
        product.purchase_price > 0 &&
        product.profit_margin
      ) {
        const expectedProfit = product.price - product.purchase_price;
        expect(product.profit_margin).toBeCloseTo(expectedProfit, 2);

        expect(product.price).toBeGreaterThan(product.purchase_price);
        expect(product.profit_margin).toBeGreaterThan(0);
      }
    });
  });

  it('should handle method not allowed', async () => {
    const response = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'PUT',
    });

    expect(response.status).toBe(405);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Method not allowed');
  });

  it('should handle server errors gracefully', async () => {
    const response = await fetch(`${apiUrl}/api/v1/products`);

    expect([200, 500]).toContain(response.status);

    if (response.status === 500) {
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Failed to fetch products');
    }
  });

  it('should return empty profit fields consistently', async () => {
    const productWithoutProfit: Omit<Product, 'id' | 'profit_margin'> = {
      name: 'Test Product Without Profit',
      img: 'no-profit.jpg',
      description: 'Product without purchase price',
      maker: 'No Profit Maker',
      metric: ProductMetric.UNIT,
      stock: 15,
      price: 50.0,
    };

    const createResponse = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productWithoutProfit),
    });

    expect(createResponse.status).toBe(201);

    const response = await fetch(`${apiUrl}/api/v1/products`);
    const data = await response.json();

    const createdProduct = data.products.find(
      (p: Product) => p.name === 'Test Product Without Profit'
    );

    expect(createdProduct).toBeDefined();
    expect(createdProduct.purchase_price).toBe(0);
    expect(createdProduct.profit_margin).toBe(0);
  });

  it('should handle products with zero purchase_price correctly', async () => {
    const productWithZeroProfit: Omit<Product, 'id' | 'profit_margin'> = {
      name: 'Test Product Zero Cost Test',
      img: 'zero-cost.jpg',
      description: 'Product with zero purchase price',
      maker: 'Zero Cost Maker',
      metric: ProductMetric.UNIT,
      stock: 10,
      price: 25.0,
      purchase_price: 0,
    };

    const createResponse = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productWithZeroProfit),
    });

    expect(createResponse.status).toBe(201);

    const response = await fetch(`${apiUrl}/api/v1/products`);
    const data = await response.json();

    const createdProduct = data.products.find(
      (p: Product) => p.name === 'Test Product Zero Cost Test'
    );

    expect(createdProduct).toBeDefined();
    expect(createdProduct.purchase_price).toBe(0);
    expect(createdProduct.profit_margin).toBe(25.0);
  });
});

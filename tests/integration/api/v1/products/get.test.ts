import { waitForAllServices } from 'tests/orchestrator';

import { Product, ProductMetric } from '../../../../../src/constants/types';

describe('GET /api/v1/products', () => {
  beforeAll(async () => {
    await waitForAllServices();
  });

  it('should return an empty array when no products exist', async () => {
    const response = await fetch('http://localhost:3000/api/v1/products');

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('products');
    expect(Array.isArray(data.products)).toBe(true);
    expect(data.products.length).toBe(0);
  });

  it('should return all products when products exist', async () => {
    const productsToCreate: Omit<Product, 'id'>[] = [
      {
        name: 'Test Product 1',
        img: 'test-image-1.jpg',
        description: 'First test product',
        maker: 'Test Maker',
        metric: ProductMetric.UNIT,
        stock: 10,
        price: 100,
      },
      {
        name: 'Test Product 2',
        img: 'test-image-2.jpg',
        description: 'Second test product',
        maker: 'Another Maker',
        metric: ProductMetric.KG,
        stock: 5,
        price: 100,
      },
      {
        name: 'Test Product 3',
        img: 'test-image-3.jpg',
        description: 'Third test product',
        maker: 'Yet Another Maker',
        metric: ProductMetric.L,
        stock: 20,
        price: 200,
      },
    ];

    const createdProductIds = [];

    for (const product of productsToCreate) {
      const createResponse = await fetch(
        'http://localhost:3000/api/v1/products',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(product),
        }
      );

      expect(createResponse.status).toBe(201);

      const createData = await createResponse.json();
      expect(createData.success).toBe(true);
      expect(createData.id).toBeDefined();

      createdProductIds.push(createData.id);
    }

    const response = await fetch('http://localhost:3000/api/v1/products');

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('products');
    expect(Array.isArray(data.products)).toBe(true);
    expect(data.products.length).toBeGreaterThanOrEqual(
      productsToCreate.length
    );

    for (let i = 0; i < createdProductIds.length; i++) {
      const foundProduct = data.products.find(
        (p) => p.id === createdProductIds[i]
      );
      expect(foundProduct).toBeDefined();
      expect(foundProduct.name).toBe(productsToCreate[i].name);
      expect(foundProduct.description).toBe(productsToCreate[i].description);
      expect(foundProduct.maker).toBe(productsToCreate[i].maker);
      expect(foundProduct.stock).toBe(productsToCreate[i].stock);
      expect(foundProduct.img).toBe(productsToCreate[i].img);
    }
  });

  it('should return the correct product structure', async () => {
    const response = await fetch('http://localhost:3000/api/v1/products');

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
    const response = await fetch('http://localhost:3000/api/v1/products', {
      method: 'PUT',
    });

    expect(response.status).toBe(405);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Method not allowed');
  });
});

import { waitForAllServices } from 'tests/orchestrator';
import { getApiEndpoint } from 'tests/utils';

import {
  Product,
  ProductMetric,
  ProductLabel,
} from '../../../../../src/constants/types';

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
        label: ProductLabel.DAIRY,
        stock: 10.5,
        price: 100.5,
        purchase_price: 80.0,
      },
      {
        name: 'Test Product 2',
        img: 'test-image-2.jpg',
        description: 'Second test product',
        maker: 'Another Maker',
        metric: ProductMetric.KG,
        label: ProductLabel.MEATS,
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
        label: ProductLabel.HAMBURGERS,
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
      expect(foundProduct.label).toBe(productsToCreate[i].label);

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
      label: ProductLabel.PROCESSED,
      stock: 15,
      price: 50.0,
      purchase_price: 0,
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
    expect(createdProduct.profit_margin).toBe(50);
    expect(createdProduct.label).toBe(ProductLabel.PROCESSED);
  });

  it('should handle products with zero purchase_price correctly', async () => {
    const productWithZeroProfit: Omit<Product, 'id' | 'profit_margin'> = {
      name: 'Test Product Zero Cost Test',
      img: 'zero-cost.jpg',
      description: 'Product with zero purchase price',
      maker: 'Zero Cost Maker',
      metric: ProductMetric.UNIT,
      label: ProductLabel.HAMBURGERS,
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
    expect(createdProduct.label).toBe(ProductLabel.HAMBURGERS);
  });

  it('should return products with 3 decimal places precision in stock field', async () => {
    const productWith3Decimals: Omit<Product, 'id' | 'profit_margin'> = {
      name: 'Test Product 3 Decimals List',
      img: 'three-decimals-list.jpg',
      description: 'Product with 3 decimal places for list test',
      maker: 'Decimal List Maker',
      metric: ProductMetric.KG,
      label: ProductLabel.DAIRY,
      stock: 15.375,
      price: 45.0,
      purchase_price: 30.0,
    };

    const createResponse = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productWith3Decimals),
    });

    expect(createResponse.status).toBe(201);

    const response = await fetch(`${apiUrl}/api/v1/products`);
    const data = await response.json();

    const createdProduct = data.products.find(
      (p: Product) => p.name === 'Test Product 3 Decimals List'
    );

    expect(createdProduct).toBeDefined();
    expect(createdProduct.stock).toBe(15.375);
    expect(createdProduct.stock.toString()).toMatch(/^\d+\.\d{3}$/);
    expect(createdProduct.label).toBe(ProductLabel.DAIRY);

    expect(Number.isFinite(createdProduct.stock)).toBe(true);
    const decimalPlaces = (createdProduct.stock.toString().split('.')[1] || '')
      .length;
    expect(decimalPlaces).toBeLessThanOrEqual(3);
  });

  it('should create and return products with different label categories', async () => {
    const productsWithLabels: Omit<Product, 'id' | 'profit_margin'>[] = [
      {
        name: 'Test Dairy Product',
        img: 'dairy.jpg',
        description: 'Dairy product test',
        maker: 'Dairy Maker',
        metric: ProductMetric.L,
        label: ProductLabel.DAIRY,
        stock: 10.0,
        price: 30.0,
        purchase_price: 20.0,
      },
      {
        name: 'Test Meat Product',
        img: 'meat.jpg',
        description: 'Meat product test',
        maker: 'Meat Maker',
        metric: ProductMetric.KG,
        label: ProductLabel.MEATS,
        stock: 5.0,
        price: 50.0,
        purchase_price: 35.0,
      },
      {
        name: 'Test Hamburger Product',
        img: 'hamburger.jpg',
        description: 'Hamburger product test',
        maker: 'Burger Maker',
        metric: ProductMetric.UNIT,
        label: ProductLabel.HAMBURGERS,
        stock: 20.0,
        price: 25.0,
        purchase_price: 15.0,
      },
      {
        name: 'Test Processed Product',
        img: 'processed.jpg',
        description: 'Processed product test',
        maker: 'Processed Maker',
        metric: ProductMetric.G,
        label: ProductLabel.PROCESSED,
        stock: 8.0,
        price: 40.0,
        purchase_price: 25.0,
      },
    ];

    const createdProducts = [];

    for (const product of productsWithLabels) {
      const createResponse = await fetch(`${apiUrl}/api/v1/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });

      expect(createResponse.status).toBe(201);
      const createData = await createResponse.json();
      createdProducts.push(createData.id);
    }

    const response = await fetch(`${apiUrl}/api/v1/products`);
    const data = await response.json();

    const dairyProduct = data.products.find(
      (p: Product) => p.name === 'Test Dairy Product'
    );
    const meatProduct = data.products.find(
      (p: Product) => p.name === 'Test Meat Product'
    );
    const hamburgerProduct = data.products.find(
      (p: Product) => p.name === 'Test Hamburger Product'
    );
    const processedProduct = data.products.find(
      (p: Product) => p.name === 'Test Processed Product'
    );

    expect(dairyProduct).toBeDefined();
    expect(dairyProduct.label).toBe(ProductLabel.DAIRY);

    expect(meatProduct).toBeDefined();
    expect(meatProduct.label).toBe(ProductLabel.MEATS);

    expect(hamburgerProduct).toBeDefined();
    expect(hamburgerProduct.label).toBe(ProductLabel.HAMBURGERS);

    expect(processedProduct).toBeDefined();
    expect(processedProduct.label).toBe(ProductLabel.PROCESSED);
  });

  it('should not be able to create a new product without label', async () => {
    const productWithoutLabel: Omit<Product, 'id' | 'profit_margin' | 'label'> =
      {
        name: 'Test Product Without Label',
        img: 'no-label.jpg',
        description: 'Product without label test',
        maker: 'No Label Maker',
        metric: ProductMetric.UNIT,
        stock: 12.0,
        price: 35.0,
        purchase_price: 20.0,
      };

    const createResponse = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productWithoutLabel),
    });

    expect(createResponse.status).toBe(400);

    const response = await fetch(`${apiUrl}/api/v1/products`);
    const data = await response.json();

    const createdProduct = data.products.find(
      (p: Product) => p.name === 'Test Product Without Label'
    );

    expect(createdProduct).toBeUndefined();
  });

  it('should validate label values are within ProductLabel enum', async () => {
    const response = await fetch(`${apiUrl}/api/v1/products`);
    const data = await response.json();

    data.products.forEach((product: Product) => {
      if (product.label !== undefined) {
        expect(Object.values(ProductLabel)).toContain(product.label);
        expect(typeof product.label).toBe('number');
        expect(product.label).toBeGreaterThanOrEqual(0);
        expect(product.label).toBeLessThanOrEqual(3);
      }
    });
  });
});

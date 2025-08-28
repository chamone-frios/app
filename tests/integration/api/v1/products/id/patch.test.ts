import { waitForAllServices } from 'tests/orchestrator';
import { getApiEndpoint } from 'tests/utils';

import {
  Product,
  ProductMetric,
  ProductLabel,
} from '../../../../../../src/constants/types';

describe('PATCH /api/v1/products/[id]', () => {
  let createdProductId: string;
  let createdProductWithProfitId: string;
  let createdProductWithLabelId: string;
  const apiUrl = getApiEndpoint();

  beforeEach(async () => {
    await waitForAllServices();

    const productToCreate: Omit<Product, 'id' | 'profit_margin'> = {
      name: 'Test Product for PATCH',
      img: 'test-patch.jpg',
      description: 'Product for testing PATCH',
      maker: 'Test Maker',
      metric: ProductMetric.UNIT,
      label: ProductLabel.DAIRY,
      stock: 10.5,
      price: 99.99,
      purchase_price: 0,
    };

    const createResponse = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productToCreate),
    });

    const createData = await createResponse.json();
    createdProductId = createData.id;

    const productWithProfit: Omit<Product, 'id' | 'profit_margin'> = {
      name: 'Test Product With Profit for PATCH',
      img: 'test-profit-patch.jpg',
      description: 'Product with profit for testing PATCH',
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
      name: 'Test Product With Label PATCH',
      img: 'test-label-patch.jpg',
      description: 'Product with label for testing PATCH',
      maker: 'Label Patch Maker',
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

  it("should return 500 when product doesn't exist", async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const updatedProduct: Omit<Product, 'id' | 'profit_margin'> = {
      img: 'updated-test.jpg',
      name: 'Updated Test Product',
      description: 'Updated Description',
      maker: 'Updated Maker',
      metric: ProductMetric.KG,
      label: ProductLabel.PROCESSED,
      stock: 20.5,
      price: 149.99,
      purchase_price: 0,
    };

    const response = await fetch(`${apiUrl}/api/v1/products/${nonExistentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProduct),
    });

    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('should return 400 when product data is invalid', async () => {
    const invalidProduct = {
      name: '',
      description: 'Updated Description',
      maker: 'Updated Maker',
      metric: 999,
      label: 99,
      stock: -5,
      price: 0,
    };

    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidProduct),
      }
    );

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Invalid data');
    expect(data).toHaveProperty('details');
    expect(Array.isArray(data.details)).toBe(true);
    expect(data.details.length).toBeGreaterThan(0);
  });

  it('should successfully update a product with valid data (without purchase_price)', async () => {
    const updatedProduct: Omit<Product, 'id' | 'profit_margin'> = {
      img: 'updated-test.jpg',
      name: 'Updated Test Product',
      description: 'Updated Description',
      maker: 'Updated Maker',
      metric: ProductMetric.KG,
      label: ProductLabel.PROCESSED,
      stock: 20.75,
      price: 149.99,
      purchase_price: 0,
    };

    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      }
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data.id).toBe(createdProductId);
  });

  it('should successfully update a product with purchase_price and calculate profit', async () => {
    const updatedProduct: Omit<Product, 'id' | 'profit_margin'> = {
      img: 'updated-profit.jpg',
      name: 'Updated Product with Profit',
      description: 'Updated Description with profit calculation',
      maker: 'Updated Profit Maker',
      metric: ProductMetric.L,
      label: ProductLabel.MEATS,
      stock: 15.25,
      price: 80.0,
      purchase_price: 50.0,
    };

    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      }
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data.id).toBe(createdProductId);
  });

  it('should confirm the product was actually updated with all new fields including label', async () => {
    const updatedProduct: Omit<Product, 'id' | 'profit_margin'> = {
      img: 'updated-test.jpg',
      name: 'Updated Test Product',
      description: 'Updated Description',
      maker: 'Updated Maker',
      metric: ProductMetric.KG,
      label: ProductLabel.HAMBURGERS,
      stock: 20.75,
      price: 149.99,
      purchase_price: 100.5,
    };

    await fetch(`${apiUrl}/api/v1/products/${createdProductId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProduct),
    });

    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('product');

    const product = data.product;
    expect(product.name).toBe('Updated Test Product');
    expect(product.description).toBe('Updated Description');
    expect(product.maker).toBe('Updated Maker');
    expect(product.metric).toBe(ProductMetric.KG);
    expect(product.label).toBe(ProductLabel.HAMBURGERS);
    expect(product.stock).toBe(20.75);
    expect(parseFloat(product.price)).toBe(149.99);
    expect(parseFloat(product.purchase_price)).toBe(100.5);
    expect(parseFloat(product.profit_margin)).toBe(49.49);
  });

  it('should update profit_margin automatically when purchase_price is provided', async () => {
    const updatedProduct: Omit<Product, 'id' | 'profit_margin'> = {
      img: 'profit-test.jpg',
      name: 'Profit Test Product',
      description: 'Testing profit calculation',
      maker: 'Profit Maker',
      metric: ProductMetric.UNIT,
      label: ProductLabel.DAIRY,
      stock: 10,
      price: 25.0,
      purchase_price: 15.0,
    };

    await fetch(`${apiUrl}/api/v1/products/${createdProductWithProfitId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProduct),
    });

    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductWithProfitId}`
    );

    const data = await response.json();
    const product = data.product;

    expect(product.purchase_price).toBe(15.0);
    expect(product.price).toBe(25.0);
    expect(product.profit_margin).toBe(10.0);
    expect(product.label).toBe(ProductLabel.DAIRY);
  });

  it('should remove profit_margin when purchase_price is removed', async () => {
    const withProfitProduct: Omit<Product, 'id' | 'profit_margin'> = {
      img: 'test.jpg',
      name: 'Test Product',
      description: 'Test',
      maker: 'Test Maker',
      metric: ProductMetric.UNIT,
      label: ProductLabel.PROCESSED,
      stock: 10,
      price: 25.0,
      purchase_price: 15.0,
    };

    await fetch(`${apiUrl}/api/v1/products/${createdProductId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(withProfitProduct),
    });

    const withoutProfitProduct: Omit<Product, 'id' | 'profit_margin'> = {
      img: 'test.jpg',
      name: 'Test Product',
      description: 'Test',
      maker: 'Test Maker',
      metric: ProductMetric.UNIT,
      label: ProductLabel.PROCESSED,
      stock: 10,
      price: 25.0,
      purchase_price: 0,
    };

    await fetch(`${apiUrl}/api/v1/products/${createdProductId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(withoutProfitProduct),
    });

    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductId}`
    );

    const data = await response.json();
    const product = data.product;

    expect(product.purchase_price).toBe(0);
    expect(product.profit_margin).toBe(0);
    expect(product.label).toBe(ProductLabel.PROCESSED);
  });

  it('should validate purchase_price business rules', async () => {
    const invalidProfitProduct = {
      img: 'test.jpg',
      name: 'Test Product',
      description: 'Test',
      maker: 'Test Maker',
      metric: ProductMetric.UNIT,
      label: ProductLabel.DAIRY,
      stock: 10,
      price: 20.0,
      purchase_price: 25.0,
    };

    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidProfitProduct),
      }
    );

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Invalid data');
    expect(data.details).toContain(
      'Sale price must be greater than purchase price'
    );
  });

  it('should validate negative purchase_price', async () => {
    const invalidPurchasePriceProduct = {
      img: 'test.jpg',
      name: 'Test Product',
      description: 'Test',
      maker: 'Test Maker',
      metric: ProductMetric.UNIT,
      label: ProductLabel.MEATS,
      stock: 10,
      price: 20.0,
      purchase_price: -5.0,
    };

    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidPurchasePriceProduct),
      }
    );

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Invalid data');
    expect(data.details).toContain(
      'Purchase price must be a non-negative number'
    );
  });

  it('should support decimal values in stock field', async () => {
    const updatedProduct: Omit<Product, 'id' | 'profit_margin'> = {
      img: 'decimal-test.jpg',
      name: 'Decimal Stock Test',
      description: 'Testing decimal stock values',
      maker: 'Decimal Maker',
      metric: ProductMetric.KG,
      label: ProductLabel.HAMBURGERS,
      stock: 12.75,
      price: 30.5,
      purchase_price: 0,
    };

    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      }
    );

    expect(response.status).toBe(200);

    const getResponse = await fetch(
      `${apiUrl}/api/v1/products/${createdProductId}`
    );
    const getData = await getResponse.json();

    expect(getData.product.stock).toBe(12.75);
    expect(getData.product.label).toBe(ProductLabel.HAMBURGERS);
  });

  it('should trigger error when trying to update a product with only some fields', async () => {
    const partialUpdate = {
      name: 'Partially Updated Product',
      price: 129.99,
    };

    const updateResponse = await fetch(
      `${apiUrl}/api/v1/products/${createdProductId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partialUpdate),
      }
    );

    expect(updateResponse.status).toBe(400);

    const errorData = await updateResponse.json();
    expect(errorData).toHaveProperty('error');
    expect(errorData.error).toBe('Invalid data');
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

  it('should handle invalid metric values', async () => {
    const invalidMetricProduct = {
      img: 'test.jpg',
      name: 'Test Product',
      description: 'Test',
      maker: 'Test Maker',
      metric: 999,
      label: ProductLabel.DAIRY,
      stock: 10,
      price: 20.0,
    };

    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidMetricProduct),
      }
    );

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('Invalid data');
    expect(
      data.details.some((detail: string) =>
        detail.includes('Metric must be one of')
      )
    ).toBe(true);
  });

  it('should validate data types for numeric fields', async () => {
    const invalidTypesProduct = {
      img: 'test.jpg',
      name: 'Test Product',
      description: 'Test',
      maker: 'Test Maker',
      metric: ProductMetric.UNIT,
      label: 'invalid',
      stock: 'invalid',
      price: 'invalid',
      purchase_price: 'invalid',
    };

    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidTypesProduct),
      }
    );

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('Invalid data');
    expect(data.details.length).toBeGreaterThan(0);
  });

  it('should update product with 3 decimal places in stock field', async () => {
    const updatedProduct: Omit<Product, 'id' | 'profit_margin'> = {
      img: 'three-decimals-patch.jpg',
      name: 'Updated Product 3 Decimals',
      description: 'Updated with 3 decimal places in stock',
      maker: 'Decimal Patch Maker',
      metric: ProductMetric.L,
      label: ProductLabel.PROCESSED,
      stock: 8.625,
      price: 25.0,
      purchase_price: 15.0,
    };

    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      }
    );

    expect(response.status).toBe(200);

    const getResponse = await fetch(
      `${apiUrl}/api/v1/products/${createdProductId}`
    );
    const getData = await getResponse.json();

    expect(getData.product.stock).toBe(8.625);
    expect(getData.product.stock.toString()).toMatch(/^\d+\.\d{3}$/);
    expect(getData.product.label).toBe(ProductLabel.PROCESSED);

    const decimalPlaces = (getData.product.stock.toString().split('.')[1] || '')
      .length;
    expect(decimalPlaces).toBe(3);
  });

  it('should update product with different label categories', async () => {
    const labelTestCases = [
      { label: ProductLabel.DAIRY, expected: ProductLabel.DAIRY },
      { label: ProductLabel.MEATS, expected: ProductLabel.MEATS },
      { label: ProductLabel.HAMBURGERS, expected: ProductLabel.HAMBURGERS },
      { label: ProductLabel.PROCESSED, expected: ProductLabel.PROCESSED },
    ];

    for (const testCase of labelTestCases) {
      const updatedProduct: Omit<Product, 'id' | 'profit_margin'> = {
        img: 'label-update-test.jpg',
        name: `Updated ${ProductLabel[testCase.label]} Product`,
        description: `Testing ${ProductLabel[testCase.label]} label update`,
        maker: 'Label Update Maker',
        metric: ProductMetric.UNIT,
        label: testCase.label,
        stock: 10.0,
        price: 50.0,
        purchase_price: 30.0,
      };

      const response = await fetch(
        `${apiUrl}/api/v1/products/${createdProductWithLabelId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProduct),
        }
      );

      expect(response.status).toBe(200);

      const getResponse = await fetch(
        `${apiUrl}/api/v1/products/${createdProductWithLabelId}`
      );
      const getData = await getResponse.json();

      expect(getData.product.label).toBe(testCase.expected);
      expect(getData.product.name).toBe(
        `Updated ${ProductLabel[testCase.label]} Product`
      );
    }
  });

  it('should successfully change label from one category to another', async () => {
    const updatedProduct: Omit<Product, 'id' | 'profit_margin'> = {
      img: 'label-change-test.jpg',
      name: 'Label Change Test Product',
      description: 'Testing label category change',
      maker: 'Label Change Maker',
      metric: ProductMetric.KG,
      label: ProductLabel.DAIRY,
      stock: 12.0,
      price: 40.0,
      purchase_price: 25.0,
    };

    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductWithLabelId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      }
    );

    expect(response.status).toBe(200);

    const getResponse = await fetch(
      `${apiUrl}/api/v1/products/${createdProductWithLabelId}`
    );
    const getData = await getResponse.json();

    expect(getData.product.label).toBe(ProductLabel.DAIRY);
    expect(getData.product.label).toBe(0);
    expect(getData.product.name).toBe('Label Change Test Product');
  });

  it('should validate that label is required field', async () => {
    const productWithoutLabel = {
      img: 'test.jpg',
      name: 'Test Product',
      description: 'Test',
      maker: 'Test Maker',
      metric: ProductMetric.UNIT,

      stock: 10,
      price: 20.0,
      purchase_price: 15.0,
    };

    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productWithoutLabel),
      }
    );

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('Invalid data');
    expect(data.details).toContain('Label must be a number');
  });

  it('should accept label value 0 (DAIRY) in updates', async () => {
    const updatedProduct: Omit<Product, 'id' | 'profit_margin'> = {
      img: 'zero-label-update.jpg',
      name: 'Zero Label Update Test',
      description: 'Testing update with label value 0',
      maker: 'Zero Label Maker',
      metric: ProductMetric.UNIT,
      label: ProductLabel.DAIRY,
      stock: 15.0,
      price: 30.0,
      purchase_price: 18.0,
    };

    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      }
    );

    expect(response.status).toBe(200);

    const getResponse = await fetch(
      `${apiUrl}/api/v1/products/${createdProductId}`
    );
    const getData = await getResponse.json();

    expect(getData.product.label).toBe(0);
    expect(getData.product.label).toBe(ProductLabel.DAIRY);
    expect(getData.product.name).toBe('Zero Label Update Test');
  });

  it('should preserve label consistency across multiple updates', async () => {
    const firstUpdate: Omit<Product, 'id' | 'profit_margin'> = {
      img: 'consistency-test-1.jpg',
      name: 'Consistency Test 1',
      description: 'First consistency test',
      maker: 'Consistency Maker',
      metric: ProductMetric.G,
      label: ProductLabel.PROCESSED,
      stock: 8.0,
      price: 25.0,
      purchase_price: 15.0,
    };

    await fetch(`${apiUrl}/api/v1/products/${createdProductId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(firstUpdate),
    });

    const secondUpdate: Omit<Product, 'id' | 'profit_margin'> = {
      img: 'consistency-test-2.jpg',
      name: 'Consistency Test 2',
      description: 'Second consistency test',
      maker: 'Consistency Maker 2',
      metric: ProductMetric.KG,
      label: ProductLabel.PROCESSED,
      stock: 12.0,
      price: 35.0,
      purchase_price: 20.0,
    };

    const response = await fetch(
      `${apiUrl}/api/v1/products/${createdProductId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(secondUpdate),
      }
    );

    expect(response.status).toBe(200);

    const getResponse = await fetch(
      `${apiUrl}/api/v1/products/${createdProductId}`
    );
    const getData = await getResponse.json();

    expect(getData.product.label).toBe(ProductLabel.PROCESSED);
    expect(getData.product.name).toBe('Consistency Test 2');
    expect(getData.product.maker).toBe('Consistency Maker 2');
  });
});

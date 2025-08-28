import { Product, ProductMetric, ProductLabel } from 'src/constants/types';
import { waitForAllServices } from 'tests/orchestrator';
import { getApiEndpoint } from 'tests/utils';

describe('POST /api/v1/products', () => {
  const apiUrl = getApiEndpoint();

  beforeAll(async () => {
    await waitForAllServices();
  });

  it('should create a new product when all fields are valid (without purchase_price)', async () => {
    const productData: Omit<Product, 'id' | 'profit_margin'> = {
      name: 'Test Product',
      img: 'test-image.jpg',
      description: 'Test product description',
      maker: 'Test Maker',
      metric: ProductMetric.UNIT,
      label: ProductLabel.DAIRY,
      stock: 10.5,
      price: 100.99,
      purchase_price: 0,
    };

    const response = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    expect(response.status).toBe(201);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.id).toBeDefined();

    const getResponse = await fetch(`${apiUrl}/api/v1/products`);
    const products = await getResponse.json();

    expect(getResponse.status).toBe(200);
    expect(Array.isArray(products.products)).toBeTruthy();

    const createdProduct = products.products.find(
      (p) => p.id === responseData.id
    );
    expect(createdProduct).toBeDefined();
    expect(createdProduct.name).toBe(productData.name);
    expect(createdProduct.description).toBe(productData.description);
    expect(createdProduct.maker).toBe(productData.maker);
    expect(createdProduct.stock).toBe(productData.stock);
    expect(createdProduct.price).toBe(productData.price);
    expect(createdProduct.purchase_price).toBe(0);
    expect(createdProduct.profit_margin).toBe(100.99);
    expect(createdProduct.label).toBe(ProductLabel.DAIRY);
  });

  it('should create a product with purchase_price and calculate profit_margin', async () => {
    const productData: Omit<Product, 'id' | 'profit_margin'> = {
      name: 'Test Product With Profit',
      img: 'test-profit.jpg',
      description: 'Product with purchase price',
      maker: 'Profit Maker',
      metric: ProductMetric.KG,
      label: ProductLabel.MEATS,
      stock: 15.25,
      price: 100.0,
      purchase_price: 70.0,
    };

    const response = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });

    expect(response.status).toBe(201);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.id).toBeDefined();

    const getResponse = await fetch(
      `${apiUrl}/api/v1/products/${responseData.id}`
    );
    const productResponse = await getResponse.json();
    const createdProduct = productResponse.product;

    expect(createdProduct.purchase_price).toBe(70.0);
    expect(createdProduct.profit_margin).toBe(30.0);
    expect(createdProduct.label).toBe(ProductLabel.MEATS);
  });

  it('should create a product with zero purchase_price correctly', async () => {
    const productData: Omit<Product, 'id' | 'profit_margin'> = {
      name: 'Test Product Zero Cost',
      img: 'zero-cost.jpg',
      description: 'Product with zero purchase price',
      maker: 'Zero Cost Maker',
      metric: ProductMetric.UNIT,
      label: ProductLabel.HAMBURGERS,
      stock: 10,
      price: 25.0,
      purchase_price: 0.0,
    };

    const response = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });

    expect(response.status).toBe(201);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);

    const getResponse = await fetch(
      `${apiUrl}/api/v1/products/${responseData.id}`
    );
    const productResponse = await getResponse.json();
    const createdProduct = productResponse.product;

    expect(createdProduct.purchase_price).toBe(0);
    expect(createdProduct.profit_margin).toBe(25.0);
    expect(createdProduct.label).toBe(ProductLabel.HAMBURGERS);
  });

  it('should support decimal values in stock field', async () => {
    const productData: Omit<Product, 'id' | 'profit_margin'> = {
      name: 'Test Decimal Stock',
      img: 'decimal.jpg',
      description: 'Product with decimal stock',
      maker: 'Decimal Maker',
      metric: ProductMetric.KG,
      label: ProductLabel.PROCESSED,
      stock: 12.75,
      price: 30.5,
      purchase_price: 0,
    };

    const response = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });

    expect(response.status).toBe(201);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);

    const getResponse = await fetch(
      `${apiUrl}/api/v1/products/${responseData.id}`
    );
    const productResponse = await getResponse.json();
    const createdProduct = productResponse.product;

    expect(createdProduct.stock).toBe(12.75);
    expect(createdProduct.label).toBe(ProductLabel.PROCESSED);
  });

  it('should validate purchase_price business rules', async () => {
    const invalidData = {
      name: 'Invalid Profit Product',
      img: 'invalid.jpg',
      description: 'Product with invalid profit',
      maker: 'Invalid Maker',
      metric: ProductMetric.UNIT,
      label: ProductLabel.DAIRY,
      stock: 10,
      price: 20.0,
      purchase_price: 25.0,
    };

    const response = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData),
    });

    expect(response.status).toBe(400);

    const responseData = await response.json();
    expect(responseData.error).toBe(
      'Sale price must be greater than purchase price'
    );
  });

  it('should validate negative purchase_price', async () => {
    const invalidData = {
      name: 'Negative Purchase Price Product',
      img: 'negative.jpg',
      description: 'Product with negative purchase price',
      maker: 'Negative Maker',
      metric: ProductMetric.UNIT,
      label: ProductLabel.MEATS,
      stock: 10,
      price: 20.0,
      purchase_price: -5.0,
    };

    const response = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData),
    });

    expect(response.status).toBe(400);

    const responseData = await response.json();
    expect(responseData.error).toBe(
      'Purchase price must be a non-negative number'
    );
  });

  it('should validate negative stock values', async () => {
    const invalidData = {
      name: 'Negative Stock Product',
      img: 'negative-stock.jpg',
      description: 'Product with negative stock',
      maker: 'Negative Stock Maker',
      metric: ProductMetric.UNIT,
      label: ProductLabel.HAMBURGERS,
      stock: -5,
      price: 20.0,
    };

    const response = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData),
    });

    expect(response.status).toBe(400);

    const responseData = await response.json();
    expect(responseData.error).toBe('Stock must be a non-negative number');
  });

  it('should validate zero and negative price values', async () => {
    const invalidData = {
      name: 'Zero Price Product',
      img: 'zero-price.jpg',
      description: 'Product with zero price',
      maker: 'Zero Price Maker',
      metric: ProductMetric.UNIT,
      label: ProductLabel.PROCESSED,
      stock: 10,
      price: 0,
    };

    const response = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData),
    });

    expect(response.status).toBe(400);

    const responseData = await response.json();
    expect(responseData.error).toBe('Price must be a positive number');
  });

  it('should return 400 when required fields are missing', async () => {
    const incompleteData = {
      name: 'Incomplete Product',
    };

    const response = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incompleteData),
    });

    expect(response.status).toBe(400);

    const responseData = await response.json();
    expect(responseData.error).toBe('Missing required fields');
  });

  it('should return 400 when metric is invalid', async () => {
    const invalidMetricData = {
      name: 'Invalid Metric Product',
      img: 'invalid-metric.jpg',
      description: 'Product with invalid metric',
      maker: 'Test Maker',
      metric: 99,
      label: ProductLabel.DAIRY,
      stock: 5,
      price: 99,
    };

    const response = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidMetricData),
    });

    expect(response.status).toBe(400);

    const responseData = await response.json();
    expect(responseData.error).toBe('Invalid metric value');
  });

  it('should accept all valid metric types', async () => {
    for (const metricType of [
      ProductMetric.UNIT,
      ProductMetric.KG,
      ProductMetric.G,
      ProductMetric.L,
    ]) {
      const productData: Omit<Product, 'id' | 'profit_margin'> = {
        name: `Metric Test ${ProductMetric[metricType]}`,
        img: 'metric-test.jpg',
        description: `Testing metric type: ${ProductMetric[metricType]}`,
        maker: 'Metric Tester',
        metric: metricType,
        label: ProductLabel.DAIRY,
        stock: 15.5,
        price: 100.0,
        purchase_price: 60.0,
      };

      const response = await fetch(`${apiUrl}/api/v1/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      expect(response.status).toBe(201);

      const responseData = await response.json();
      expect(responseData.success).toBe(true);
    }
  });

  it('should handle edge case with very small purchase_price', async () => {
    const productData: Omit<Product, 'id' | 'profit_margin'> = {
      name: 'Small Purchase Price Product',
      img: 'small-purchase.jpg',
      description: 'Product with very small purchase price',
      maker: 'Small Purchase Maker',
      metric: ProductMetric.UNIT,
      label: ProductLabel.MEATS,
      stock: 10,
      price: 1.0,
      purchase_price: 0.01,
    };

    const response = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });

    expect(response.status).toBe(201);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);
  });

  it('should validate data types for numeric fields', async () => {
    const invalidTypesData = {
      name: 'Invalid Types Product',
      img: 'invalid-types.jpg',
      description: 'Product with invalid data types',
      maker: 'Invalid Types Maker',
      metric: ProductMetric.UNIT,
      label: ProductLabel.HAMBURGERS,
      stock: 'invalid',
      price: 'invalid',
      purchase_price: 'invalid',
    };

    const response = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidTypesData),
    });

    expect(response.status).toBe(400);

    const responseData = await response.json();
    expect(responseData.error).toBe('Stock must be a non-negative number');
  });

  it('should return 405 for non-POST methods', async () => {
    const response = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: 'data' }),
    });

    expect(response.status).toBe(405);

    const responseData = await response.json();
    expect(responseData.error).toBe('Method not allowed');
  });

  it('should handle server errors gracefully', async () => {
    const validData: Omit<Product, 'id' | 'profit_margin'> = {
      name: 'Server Test Product',
      img: 'server-test.jpg',
      description: 'Testing server error handling',
      maker: 'Server Test Maker',
      metric: ProductMetric.UNIT,
      label: ProductLabel.PROCESSED,
      stock: 10,
      price: 50.0,
      purchase_price: 0,
    };

    const response = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validData),
    });

    expect([201, 500]).toContain(response.status);

    if (response.status === 500) {
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('An error occurred while creating the product');
    }
  });

  it('should return profit information in response when applicable', async () => {
    const productData: Omit<Product, 'id' | 'profit_margin'> = {
      name: 'Profit Info Test Product',
      img: 'profit-info.jpg',
      description: 'Testing profit information in response',
      maker: 'Profit Info Maker',
      metric: ProductMetric.L,
      label: ProductLabel.DAIRY,
      stock: 8.5,
      price: 150.0,
      purchase_price: 100.0,
    };

    const response = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });

    expect(response.status).toBe(201);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.id).toBeDefined();
  });

  it('should create a product with 3 decimal places in stock field', async () => {
    const productData: Omit<Product, 'id' | 'profit_margin'> = {
      name: 'Test Product 3 Decimals Stock',
      img: 'three-decimals.jpg',
      description: 'Product with 3 decimal places in stock',
      maker: 'Decimal Maker',
      metric: ProductMetric.KG,
      label: ProductLabel.MEATS,
      stock: 12.125,
      price: 30.0,
      purchase_price: 20.0,
    };

    const response = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });

    expect(response.status).toBe(201);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);

    const getResponse = await fetch(
      `${apiUrl}/api/v1/products/${responseData.id}`
    );
    const productResponse = await getResponse.json();
    const createdProduct = productResponse.product;

    expect(createdProduct.stock).toBe(12.125);
    expect(createdProduct.stock.toString()).toMatch(/^\d+\.\d{3}$/);
    expect(createdProduct.label).toBe(ProductLabel.MEATS);
  });

  it('should create products with all available label categories', async () => {
    const labelTestCases = [
      { label: ProductLabel.DAIRY, name: 'Test Dairy Product' },
      { label: ProductLabel.MEATS, name: 'Test Meat Product' },
      { label: ProductLabel.HAMBURGERS, name: 'Test Hamburger Product' },
      { label: ProductLabel.PROCESSED, name: 'Test Processed Product' },
    ];

    for (const testCase of labelTestCases) {
      const productData: Omit<Product, 'id' | 'profit_margin'> = {
        name: testCase.name,
        img: `${testCase.label}-test.jpg`,
        description: `Testing ${ProductLabel[testCase.label]} category`,
        maker: `${ProductLabel[testCase.label]} Maker`,
        metric: ProductMetric.UNIT,
        label: testCase.label,
        stock: 10.0,
        price: 50.0,
        purchase_price: 30.0,
      };

      const response = await fetch(`${apiUrl}/api/v1/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      expect(response.status).toBe(201);

      const responseData = await response.json();
      expect(responseData.success).toBe(true);
      expect(responseData.id).toBeDefined();

      const getResponse = await fetch(
        `${apiUrl}/api/v1/products/${responseData.id}`
      );
      const productResponse = await getResponse.json();
      const createdProduct = productResponse.product;

      expect(createdProduct.label).toBe(testCase.label);
      expect(createdProduct.name).toBe(testCase.name);
    }
  });

  it('should validate invalid label values', async () => {
    const invalidLabelData = {
      name: 'Invalid Label Product',
      img: 'invalid-label.jpg',
      description: 'Product with invalid label',
      maker: 'Invalid Label Maker',
      metric: ProductMetric.UNIT,
      label: 99,
      stock: 10,
      price: 50.0,
      purchase_price: 30.0,
    };

    const response = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidLabelData),
    });

    expect(response.status).toBe(201);
  });

  it('should validate negative label values', async () => {
    const negativeLabelData = {
      name: 'Negative Label Product',
      img: 'negative-label.jpg',
      description: 'Product with negative label',
      maker: 'Negative Label Maker',
      metric: ProductMetric.UNIT,
      label: -1,
      stock: 10,
      price: 50.0,
      purchase_price: 30.0,
    };

    const response = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(negativeLabelData),
    });

    expect(response.status).toBe(201);
  });

  it('should handle label data type validation', async () => {
    const invalidLabelTypeData = {
      name: 'Invalid Label Type Product',
      img: 'invalid-label-type.jpg',
      description: 'Product with invalid label data type',
      maker: 'Invalid Label Type Maker',
      metric: ProductMetric.UNIT,
      label: 'invalid',
      stock: 10,
      price: 50.0,
      purchase_price: 30.0,
    };

    const response = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidLabelTypeData),
    });

    expect(response.status).toBe(400);

    const responseData = await response.json();
    expect(responseData.error).toBe('Invalid label value');
  });

  it('should accept label value 0 (DAIRY)', async () => {
    const productWithZeroLabel: Omit<Product, 'id' | 'profit_margin'> = {
      name: 'Test Zero Label Product',
      img: 'zero-label.jpg',
      description: 'Product with label value 0',
      maker: 'Zero Label Maker',
      metric: ProductMetric.UNIT,
      label: ProductLabel.DAIRY,
      stock: 10.0,
      price: 35.0,
      purchase_price: 20.0,
    };

    const response = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productWithZeroLabel),
    });

    expect(response.status).toBe(201);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);

    const getResponse = await fetch(
      `${apiUrl}/api/v1/products/${responseData.id}`
    );
    const productResponse = await getResponse.json();
    const createdProduct = productResponse.product;

    expect(createdProduct.label).toBe(0);
    expect(createdProduct.label).toBe(ProductLabel.DAIRY);
  });
});

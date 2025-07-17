import { CreateOrderRequest, ProductMetric } from 'src/constants/types';
import { waitForAllServices } from 'tests/orchestrator';
import { getApiEndpoint } from 'tests/utils';

describe('POST /api/v1/orders', () => {
  let testClientId: string;
  let testProductId: string;
  const apiUrl = getApiEndpoint();

  beforeAll(async () => {
    await waitForAllServices();

    const clientData = {
      name: 'Test Order Client',
      establishment_type: 'Restaurant',
      phone: '+1234567890',
      maps_link: 'https://maps.google.com/test-order-client',
    };

    const clientResponse = await fetch(`${apiUrl}/api/v1/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });

    const clientResult = await clientResponse.json();
    testClientId = clientResult.id;

    const productData = {
      name: 'Test Order Product',
      img: 'test-order-product.jpg',
      description: 'Product for order testing',
      maker: 'Test Maker',
      metric: ProductMetric.UNIT,
      stock: 100,
      price: 50.0,
    };

    const productResponse = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    const productResult = await productResponse.json();
    testProductId = productResult.id;
  });

  it('should create a new order when all required fields are valid', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 2,
        },
      ],
      discount: 5.0,
      tax: 10.0,
      notes: 'Test order',
    };

    const response = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    expect(response.status).toBe(201);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.id).toBeDefined();
    expect(typeof responseData.id).toBe('string');
  });

  it('should create an order with minimal required fields', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 1,
        },
      ],
    };

    const response = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    expect(response.status).toBe(201);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.id).toBeDefined();
  });

  it('should return 400 when client_id is missing', async () => {
    const orderData = {
      items: [
        {
          product_id: testProductId,
          quantity: 1,
        },
      ],
    };

    const response = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    expect(response.status).toBe(400);

    const responseData = await response.json();
    expect(responseData.error).toBe('Missing required field: client_id');
  });

  it('should return 400 when items array is missing or empty', async () => {
    const orderDataNoItems = {
      client_id: testClientId,
    };

    const response1 = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderDataNoItems),
    });

    expect(response1.status).toBe(400);

    const responseData1 = await response1.json();
    expect(responseData1.error).toBe(
      'Missing required field: items (must be a non-empty array)'
    );

    const orderDataEmptyItems = {
      client_id: testClientId,
      items: [],
    };

    const response2 = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderDataEmptyItems),
    });

    expect(response2.status).toBe(400);

    const responseData2 = await response2.json();
    expect(responseData2.error).toBe(
      'Missing required field: items (must be a non-empty array)'
    );
  });

  it('should return 400 when item has missing product_id', async () => {
    const orderData = {
      client_id: testClientId,
      items: [
        {
          quantity: 1,
        },
      ],
    };

    const response = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    expect(response.status).toBe(400);

    const responseData = await response.json();
    expect(responseData.error).toBe('Missing product_id for item at index 0');
  });

  it('should return 400 when item has invalid quantity', async () => {
    const orderDataZeroQuantity = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 0,
        },
      ],
    };

    const response1 = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderDataZeroQuantity),
    });

    expect(response1.status).toBe(400);

    const responseData1 = await response1.json();
    expect(responseData1.error).toBe(
      'Invalid quantity for item at index 0 (must be greater than 0)'
    );

    const orderDataNegativeQuantity = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: -1,
        },
      ],
    };

    const response2 = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderDataNegativeQuantity),
    });

    expect(response2.status).toBe(400);

    const responseData2 = await response2.json();
    expect(responseData2.error).toBe(
      'Invalid quantity for item at index 0 (must be greater than 0)'
    );
  });

  it('should return 400 when discount is invalid', async () => {
    const orderData = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 1,
        },
      ],
      discount: -5,
    };

    const response = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    expect(response.status).toBe(400);

    const responseData = await response.json();
    expect(responseData.error).toBe(
      'Invalid discount value (must be a non-negative number)'
    );
  });

  it('should return 400 when tax is invalid', async () => {
    const orderData = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 1,
        },
      ],
      tax: -10,
    };

    const response = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    expect(response.status).toBe(400);

    const responseData = await response.json();
    expect(responseData.error).toBe(
      'Invalid tax value (must be a non-negative number)'
    );
  });

  it('should return 404 when client does not exist', async () => {
    const nonExistentClientId = '00000000-0000-0000-0000-000000000000';
    const orderData = {
      client_id: nonExistentClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 1,
        },
      ],
    };

    const response = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    expect(response.status).toBe(404);

    const responseData = await response.json();
    expect(responseData.error).toContain('not found');
  });

  it('should return 404 when product does not exist', async () => {
    const nonExistentProductId = '00000000-0000-0000-0000-000000000000';
    const orderData = {
      client_id: testClientId,
      items: [
        {
          product_id: nonExistentProductId,
          quantity: 1,
        },
      ],
    };

    const response = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    expect(response.status).toBe(404);

    const responseData = await response.json();
    expect(responseData.error).toContain('not found');
  });

  it('should return 400 when insufficient stock', async () => {
    const orderData = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 1000,
        },
      ],
    };

    const response = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    expect(response.status).toBe(400);

    const responseData = await response.json();
    expect(responseData.error).toContain('Insufficient stock');
  });

  it('should return 405 for non-POST methods', async () => {
    const response = await fetch(`${apiUrl}/api/v1/orders`, {
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
});

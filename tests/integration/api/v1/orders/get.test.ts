import { CreateOrderRequest, ProductMetric } from 'src/constants/types';
import { waitForAllServices } from 'tests/orchestrator';
import { getApiEndpoint } from 'tests/utils';

describe('GET /api/v1/orders', () => {
  let testClientId: string;
  let testProductId: string;
  const apiUrl = getApiEndpoint();

  beforeAll(async () => {
    await waitForAllServices();

    const clientData = {
      name: 'Test Orders Client',
      establishment_type: 'Restaurant',
      phone: '+1234567890',
      maps_link: 'https://maps.google.com/test-orders-client',
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
      name: 'Test Orders Product',
      img: 'test-orders-product.jpg',
      description: 'Product for orders testing',
      maker: 'Test Maker',
      metric: ProductMetric.UNIT,
      stock: 100,
      price: 25.0,
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

  it('should return an empty array when no orders exist', async () => {
    const response = await fetch(`${apiUrl}/api/v1/orders`);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('orders');
    expect(Array.isArray(data.orders)).toBe(true);
    expect(data.orders.length).toBe(0);
  });

  it('should return all orders when orders exist', async () => {
    const ordersToCreate: CreateOrderRequest[] = [
      {
        client_id: testClientId,
        items: [
          {
            product_id: testProductId,
            quantity: 2,
          },
        ],
        discount: 5.0,
        tax: 2.5,
        notes: 'First test order',
      },
      {
        client_id: testClientId,
        items: [
          {
            product_id: testProductId,
            quantity: 1,
          },
        ],
        discount: 0,
        tax: 1.0,
        notes: 'Second test order',
      },
      {
        client_id: testClientId,
        items: [
          {
            product_id: testProductId,
            quantity: 3,
          },
        ],
        notes: 'Third test order',
      },
    ];

    const createdOrderIds = [];

    for (const order of ordersToCreate) {
      const createResponse = await fetch(`${apiUrl}/api/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      expect(createResponse.status).toBe(201);

      const createData = await createResponse.json();
      expect(createData.success).toBe(true);
      expect(createData.id).toBeDefined();

      createdOrderIds.push(createData.id);
    }

    const response = await fetch(`${apiUrl}/api/v1/orders`);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('orders');
    expect(Array.isArray(data.orders)).toBe(true);
    expect(data.orders.length).toBeGreaterThanOrEqual(ordersToCreate.length);

    for (let i = 0; i < createdOrderIds.length; i++) {
      const foundOrder = data.orders.find((o) => o.id === createdOrderIds[i]);
      expect(foundOrder).toBeDefined();
      expect(foundOrder.client_id).toBe(testClientId);
      expect(foundOrder.notes).toBe(ordersToCreate[i].notes);
    }
  });

  it('should return the correct order structure', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 1,
        },
      ],
      discount: 10.0,
      tax: 5.0,
      notes: 'Structure test order',
    };

    const createResponse = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    expect(createResponse.status).toBe(201);

    const response = await fetch(`${apiUrl}/api/v1/orders`);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.orders.length).toBeGreaterThan(0);

    const order = data.orders[0];

    expect(order).toHaveProperty('id');
    expect(order).toHaveProperty('client_id');
    expect(order).toHaveProperty('client_name');
    expect(order).toHaveProperty('client_establishment_type');
    expect(order).toHaveProperty('client_phone');
    expect(order).toHaveProperty('status');
    expect(order).toHaveProperty('subtotal');
    expect(order).toHaveProperty('discount');
    expect(order).toHaveProperty('tax');
    expect(order).toHaveProperty('total');
    expect(order).toHaveProperty('notes');
    expect(order).toHaveProperty('created_at');

    expect(typeof order.id).toBe('string');
    expect(typeof order.client_id).toBe('string');
    expect(typeof order.client_name).toBe('string');
    expect(typeof order.client_establishment_type).toBe('string');
    expect(typeof order.client_phone).toBe('string');
    expect(typeof order.status).toBe('string');
    expect(typeof order.subtotal).toBe('number');
    expect(typeof order.total).toBe('number');

    expect(order).not.toHaveProperty('items');
  });

  it('should return orders sorted by created_at DESC', async () => {
    const order1Data: CreateOrderRequest = {
      client_id: testClientId,
      items: [{ product_id: testProductId, quantity: 1 }],
      notes: 'First order',
    };

    const response1 = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order1Data),
    });
    const result1 = await response1.json();

    await new Promise((resolve) => setTimeout(resolve, 100));

    const order2Data: CreateOrderRequest = {
      client_id: testClientId,
      items: [{ product_id: testProductId, quantity: 1 }],
      notes: 'Second order',
    };

    const response2 = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order2Data),
    });
    const result2 = await response2.json();

    const getResponse = await fetch(`${apiUrl}/api/v1/orders`);
    const getData = await getResponse.json();

    expect(getResponse.status).toBe(200);

    const order1 = getData.orders.find((o) => o.id === result1.id);
    const order2 = getData.orders.find((o) => o.id === result2.id);

    expect(order1).toBeDefined();
    expect(order2).toBeDefined();

    const order1Index = getData.orders.findIndex((o) => o.id === result1.id);
    const order2Index = getData.orders.findIndex((o) => o.id === result2.id);

    expect(order2Index).toBeLessThan(order1Index);
  });

  it('should handle different order statuses', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [{ product_id: testProductId, quantity: 1 }],
      notes: 'Status test order',
    };

    const createResponse = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    expect(createResponse.status).toBe(201);

    const response = await fetch(`${apiUrl}/api/v1/orders`);
    const data = await response.json();

    expect(response.status).toBe(200);

    const createdOrder = data.orders.find(
      (o) => o.notes === 'Status test order'
    );
    expect(createdOrder).toBeDefined();
    expect(createdOrder.status).toBe('pending');
  });

  it('should handle method not allowed', async () => {
    const response = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'PUT',
    });

    expect(response.status).toBe(405);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Method not allowed');
  });

  it('should handle orders with minimal and full data', async () => {
    const minimalOrderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [{ product_id: testProductId, quantity: 1 }],
    };

    const minimalResponse = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(minimalOrderData),
    });
    const minimalResult = await minimalResponse.json();

    const fullOrderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [{ product_id: testProductId, quantity: 2 }],
      discount: 15.0,
      tax: 7.5,
      notes: 'Full data order',
    };

    const fullResponse = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullOrderData),
    });
    const fullResult = await fullResponse.json();

    const getResponse = await fetch(`${apiUrl}/api/v1/orders`);
    const getData = await getResponse.json();

    expect(getResponse.status).toBe(200);

    const minimalOrder = getData.orders.find((o) => o.id === minimalResult.id);
    const fullOrder = getData.orders.find((o) => o.id === fullResult.id);

    expect(minimalOrder).toBeDefined();
    expect(fullOrder).toBeDefined();

    expect(minimalOrder.discount).toBe(0);
    expect(minimalOrder.tax).toBe(0);
    expect(minimalOrder.notes).toBeNull();

    expect(fullOrder.discount).toBe(15.0);
    expect(fullOrder.tax).toBe(7.5);
    expect(fullOrder.notes).toBe('Full data order');
  });
});

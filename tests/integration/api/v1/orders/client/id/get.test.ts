import { CreateOrderRequest, ProductMetric } from 'src/constants/types';
import { waitForAllServices } from 'tests/orchestrator';
import { getApiEndpoint } from 'tests/utils';

describe('GET /api/v1/orders/client/[id]', () => {
  let createdClientId: string;
  let testProductId: string;
  const createdOrderIds: string[] = [];
  const apiUrl = getApiEndpoint();

  beforeAll(async () => {
    await waitForAllServices();

    const clientToCreate = {
      name: 'Test Client for Orders',
      establishment_type: 'Restaurant',
      phone: '+1234567890',
      maps_link: 'https://maps.google.com/test-client-orders',
    };

    const clientResponse = await fetch(`${apiUrl}/api/v1/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientToCreate),
    });

    const clientData = await clientResponse.json();
    createdClientId = clientData.id;

    const productToCreate = {
      name: 'Test Product for Client Orders',
      img: 'test-client-orders.jpg',
      description: 'Product for testing client orders',
      maker: 'Test Maker',
      metric: ProductMetric.UNIT,
      stock: 100,
      price: 50.0,
    };

    const productResponse = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productToCreate),
    });

    const productData = await productResponse.json();
    testProductId = productData.id;

    const ordersToCreate: CreateOrderRequest[] = [
      {
        client_id: createdClientId,
        items: [{ product_id: testProductId, quantity: 2 }],
        discount: 10.0,
        tax: 5.0,
        notes: 'First order for client',
      },
      {
        client_id: createdClientId,
        items: [{ product_id: testProductId, quantity: 1 }],
        notes: 'Second order for client',
      },
      {
        client_id: createdClientId,
        items: [{ product_id: testProductId, quantity: 3 }],
        discount: 15.0,
        notes: 'Third order for client',
      },
    ];

    for (const order of ordersToCreate) {
      const orderResponse = await fetch(`${apiUrl}/api/v1/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });

      const orderData = await orderResponse.json();
      createdOrderIds.push(orderData.id);
    }
  });

  it("should return 404 when client doesn't exist", async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const response = await fetch(
      `${apiUrl}/api/v1/orders/client/${nonExistentId}`
    );

    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Client not found');
  });

  it('should return empty array when client has no orders', async () => {
    const emptyClientData = {
      name: 'Empty Client',
      establishment_type: 'Cafe',
      phone: '+9876543210',
    };

    const clientResponse = await fetch(`${apiUrl}/api/v1/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emptyClientData),
    });

    const clientData = await clientResponse.json();
    const emptyClientId = clientData.id;

    const response = await fetch(
      `${apiUrl}/api/v1/orders/client/${emptyClientId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('orders');
    expect(Array.isArray(data.orders)).toBe(true);
    expect(data.orders.length).toBe(0);
  });

  it('should return all orders for a specific client when valid ID is provided', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/client/${createdClientId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('orders');
    expect(Array.isArray(data.orders)).toBe(true);
    expect(data.orders.length).toBe(3);

    data.orders.forEach((order) => {
      expect(order.client_id).toBe(createdClientId);
    });

    createdOrderIds.forEach((orderId) => {
      const foundOrder = data.orders.find((o) => o.id === orderId);
      expect(foundOrder).toBeDefined();
    });
  });

  it('should return the correct order structure for client orders', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/client/${createdClientId}`
    );

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

    expect(order.client_id).toBe(createdClientId);

    expect(order).not.toHaveProperty('items');
  });

  it('should return orders sorted by created_at DESC', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/client/${createdClientId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.orders.length).toBeGreaterThan(1);

    for (let i = 0; i < data.orders.length - 1; i++) {
      const currentOrderDate = new Date(data.orders[i].created_at);
      const nextOrderDate = new Date(data.orders[i + 1].created_at);
      expect(currentOrderDate.getTime()).toBeGreaterThanOrEqual(
        nextOrderDate.getTime()
      );
    }
  });

  it('should handle invalid client ID format', async () => {
    const invalidId = 'invalid-uuid-format';
    const response = await fetch(`${apiUrl}/api/v1/orders/client/${invalidId}`);

    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Failed to fetch client orders');
  });

  it('should handle missing client ID', async () => {
    const response = await fetch(`${apiUrl}/api/v1/orders/client/`);

    expect(response.status).toBe(404);
  });

  it('should handle method not allowed', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/client/${createdClientId}`,
      { method: 'PUT' }
    );

    expect(response.status).toBe(405);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Method not allowed');
  });

  it('should verify client information is included in orders', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/client/${createdClientId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.orders.length).toBeGreaterThan(0);

    const order = data.orders[0];

    expect(order.client_name).toBe('Test Client for Orders');
    expect(order.client_establishment_type).toBe('Restaurant');
    expect(order.client_phone).toBe('+1234567890');
  });

  it('should handle orders with different discount and tax values', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/client/${createdClientId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();

    const orderWithDiscount = data.orders.find((o) => o.discount > 0);
    const orderWithoutDiscount = data.orders.find(
      (o) => !o.discount || o.discount === 0
    );

    expect(orderWithDiscount).toBeDefined();
    expect(orderWithoutDiscount).toBeDefined();

    expect(typeof orderWithDiscount.discount).toBe('number');
    expect(orderWithDiscount.discount).toBeGreaterThan(0);
  });
});

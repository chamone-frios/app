import { CreateOrderRequest, ProductMetric } from 'src/constants/types';
import { waitForAllServices } from 'tests/orchestrator';
import { getApiEndpoint } from 'tests/utils';

describe('GET /api/v1/orders/client/[id]', () => {
  let createdClientId: string;
  let testProductId: string;
  let testProductWithProfitId: string;
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
      stock: 100.5,
      price: 50.0,
    };

    const productResponse = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productToCreate),
    });

    const productData = await productResponse.json();
    testProductId = productData.id;

    const productWithProfitToCreate = {
      name: 'Test Product With Profit for Client Orders',
      img: 'test-profit-client-orders.jpg',
      description: 'Product with profit for testing client orders',
      maker: 'Profit Maker',
      metric: ProductMetric.KG,
      stock: 50.25,
      price: 80.0,
      purchase_price: 50.0,
    };

    const productWithProfitResponse = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productWithProfitToCreate),
    });

    const productWithProfitData = await productWithProfitResponse.json();
    testProductWithProfitId = productWithProfitData.id;

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
        items: [
          { product_id: testProductId, quantity: 1 },
          { product_id: testProductWithProfitId, quantity: 2.5 },
        ],
        discount: 15.0,
        notes: 'Third order for client with profit items',
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

  it('should return the correct order structure for client orders with profit fields', async () => {
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

    expect(order).toHaveProperty('total_purchase_cost');
    expect(order).toHaveProperty('total_profit');
    expect(order).toHaveProperty('profit_margin_percentage');

    expect(typeof order.id).toBe('string');
    expect(typeof order.client_id).toBe('string');
    expect(typeof order.client_name).toBe('string');
    expect(typeof order.client_establishment_type).toBe('string');
    expect(typeof order.client_phone).toBe('string');
    expect(typeof order.status).toBe('string');
    expect(typeof order.subtotal).toBe('number');
    expect(typeof order.total).toBe('number');

    expect(typeof order.total_purchase_cost).toBe('number');
    expect(typeof order.total_profit).toBe('number');
    expect(typeof order.profit_margin_percentage).toBe('number');

    expect(order.total_purchase_cost).toBeGreaterThanOrEqual(0);
    expect(order.total_profit).toBeGreaterThanOrEqual(0);
    expect(order.profit_margin_percentage).toBeGreaterThanOrEqual(0);

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
    const orderWithoutDiscount = data.orders.find((o) => o.discount === 0);

    expect(orderWithDiscount).toBeDefined();
    expect(orderWithoutDiscount).toBeDefined();

    expect(typeof orderWithDiscount.discount).toBe('number');
    expect(orderWithDiscount.discount).toBeGreaterThan(0);
    expect(typeof orderWithoutDiscount.discount).toBe('number');
    expect(orderWithoutDiscount.discount).toBe(0);
  });

  it('should return profit data for orders with profit items', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/client/${createdClientId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();

    const orderWithProfitItems = data.orders.find(
      (order) => order.notes === 'Third order for client with profit items'
    );

    expect(orderWithProfitItems).toBeDefined();

    expect(orderWithProfitItems.total_purchase_cost).toBeGreaterThan(0);
    expect(orderWithProfitItems.total_profit).toBeGreaterThan(0);
    expect(orderWithProfitItems.profit_margin_percentage).toBeGreaterThan(0);

    expect(orderWithProfitItems.total_profit).toBeCloseTo(125, 1);
  });

  it('should return zero profit data for orders without profit items', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/client/${createdClientId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();

    const ordersWithoutProfitItems = data.orders.filter(
      (order) =>
        order.notes === 'First order for client' ||
        order.notes === 'Second order for client'
    );

    expect(ordersWithoutProfitItems.length).toBe(2);

    ordersWithoutProfitItems.forEach((order) => {
      expect(order.total_purchase_cost).toBe(0);

      expect(order.total_profit).toBeGreaterThan(0);
      expect(order.total_profit).toBe(order.subtotal);

      expect(order.profit_margin_percentage).toBe(100);
    });
  });

  it('should validate profit calculations consistency', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/client/${createdClientId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();

    data.orders.forEach((order) => {
      expect(order.total_purchase_cost).toBeGreaterThanOrEqual(0);
      expect(order.total_profit).toBeGreaterThanOrEqual(0);
      expect(order.profit_margin_percentage).toBeGreaterThanOrEqual(0);
      expect(order.profit_margin_percentage).toBeLessThanOrEqual(100);

      if (order.subtotal > 0) {
        const expectedPercentage = (order.total_profit / order.subtotal) * 100;
        expect(order.profit_margin_percentage).toBeCloseTo(
          expectedPercentage,
          1
        );
      }

      expect(order.total_profit).toBeLessThanOrEqual(order.subtotal);

      if (order.discount > 0) {
        expect(order.total).toBeLessThan(order.subtotal);
      }

      expect(Number.isFinite(order.total_purchase_cost)).toBe(true);
      expect(Number.isFinite(order.total_profit)).toBe(true);
      expect(Number.isFinite(order.profit_margin_percentage)).toBe(true);
    });
  });

  it('should handle decimal quantities in profit calculations', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/client/${createdClientId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();

    const orderWithDecimalQuantity = data.orders.find(
      (order) => order.notes === 'Third order for client with profit items'
    );

    expect(orderWithDecimalQuantity).toBeDefined();

    expect(orderWithDecimalQuantity.total_profit).toBeGreaterThan(0);
    expect(Number.isFinite(orderWithDecimalQuantity.total_profit)).toBe(true);

    const profit = orderWithDecimalQuantity.total_profit;
    expect(profit.toString()).toMatch(/^\d+(\.\d+)?$/);
  });

  it('should return consistent data types for all numeric fields', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/client/${createdClientId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();

    data.orders.forEach((order) => {
      expect(typeof order.subtotal).toBe('number');
      expect(typeof order.discount).toBe('number');
      expect(typeof order.tax).toBe('number');
      expect(typeof order.total).toBe('number');

      expect(typeof order.total_purchase_cost).toBe('number');
      expect(typeof order.total_profit).toBe('number');
      expect(typeof order.profit_margin_percentage).toBe('number');

      expect(isNaN(order.subtotal)).toBe(false);
      expect(isNaN(order.discount)).toBe(false);
      expect(isNaN(order.tax)).toBe(false);
      expect(isNaN(order.total)).toBe(false);
      expect(isNaN(order.total_purchase_cost)).toBe(false);
      expect(isNaN(order.total_profit)).toBe(false);
      expect(isNaN(order.profit_margin_percentage)).toBe(false);
    });
  });

  it('should handle server errors gracefully', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/client/${createdClientId}`
    );

    expect([200, 500]).toContain(response.status);

    if (response.status === 500) {
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Failed to fetch client orders');
    }
  });
});

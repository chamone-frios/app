import { CreateOrderRequest, ProductMetric } from 'src/constants/types';
import { waitForAllServices } from 'tests/orchestrator';
import { getApiEndpoint } from 'tests/utils';

describe('GET /api/v1/orders', () => {
  let testClientId: string;
  let testProductId: string;
  let testProductWithProfitId: string;
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
      stock: 100.5,
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

    const productWithProfitData = {
      name: 'Test Orders Product With Profit',
      img: 'test-orders-product-profit.jpg',
      description: 'Product with profit for orders testing',
      maker: 'Profit Maker',
      metric: ProductMetric.KG,
      stock: 50.25,
      price: 40.0,
      purchase_price: 25.0,
    };

    const productWithProfitResponse = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productWithProfitData),
    });

    const productWithProfitResult = await productWithProfitResponse.json();
    testProductWithProfitId = productWithProfitResult.id;
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
            product_id: testProductWithProfitId,
            quantity: 2.5,
          },
        ],
        discount: 10.0,
        notes: 'Third test order with profit',
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

  it('should return the correct order structure with profit fields', async () => {
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
    expect(typeof order.discount).toBe('number');
    expect(typeof order.tax).toBe('number');
    expect(typeof order.total).toBe('number');

    expect(typeof order.total_purchase_cost).toBe('number');
    expect(typeof order.total_profit).toBe('number');
    expect(typeof order.profit_margin_percentage).toBe('number');

    expect(order.total_purchase_cost).toBeGreaterThanOrEqual(0);
    expect(order.total_profit).toBeGreaterThanOrEqual(0);
    expect(order.profit_margin_percentage).toBeGreaterThanOrEqual(0);

    expect(order).not.toHaveProperty('items');
  });

  it('should return orders sorted by created_at DESC', async () => {
    const order1Data: CreateOrderRequest = {
      client_id: testClientId,
      items: [{ product_id: testProductId, quantity: 1 }],
      notes: 'First order for sorting',
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
      notes: 'Second order for sorting',
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

    expect(typeof minimalOrder.total_purchase_cost).toBe('number');
    expect(typeof minimalOrder.total_profit).toBe('number');
    expect(typeof minimalOrder.profit_margin_percentage).toBe('number');

    expect(typeof fullOrder.total_purchase_cost).toBe('number');
    expect(typeof fullOrder.total_profit).toBe('number');
    expect(typeof fullOrder.profit_margin_percentage).toBe('number');
  });

  it('should return orders with profit data for products without purchase_price', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [{ product_id: testProductId, quantity: 2 }],
      discount: 5.0,
      notes: 'Order without profit items',
    };

    const createResponse = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    expect(createResponse.status).toBe(201);
    const createData = await createResponse.json();

    const getResponse = await fetch(`${apiUrl}/api/v1/orders`);
    const getData = await getResponse.json();

    const order = getData.orders.find((o) => o.id === createData.id);
    expect(order).toBeDefined();

    expect(order.total_purchase_cost).toBe(0);
    expect(order.total_profit).toBe(50.0);
    expect(order.profit_margin_percentage).toBe(100);
    expect(order.subtotal).toBe(50.0);
  });

  it('should return orders with profit data for products with purchase_price', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [{ product_id: testProductWithProfitId, quantity: 2 }],
      discount: 10.0,
      notes: 'Order with profit items',
    };

    const createResponse = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    expect(createResponse.status).toBe(201);
    const createData = await createResponse.json();

    const getResponse = await fetch(`${apiUrl}/api/v1/orders`);
    const getData = await getResponse.json();

    const order = getData.orders.find((o) => o.id === createData.id);
    expect(order).toBeDefined();

    expect(order.subtotal).toBe(80.0);
    expect(order.total_purchase_cost).toBe(50.0);
    expect(order.total_profit).toBe(30.0);
    expect(order.profit_margin_percentage).toBe(37.5);
  });

  it('should handle decimal quantities in profit calculations', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [{ product_id: testProductWithProfitId, quantity: 1.5 }],
      notes: 'Order with decimal quantity',
    };

    const createResponse = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    expect(createResponse.status).toBe(201);
    const createData = await createResponse.json();

    const getResponse = await fetch(`${apiUrl}/api/v1/orders`);
    const getData = await getResponse.json();

    const order = getData.orders.find((o) => o.id === createData.id);
    expect(order).toBeDefined();

    expect(order.subtotal).toBe(60.0);
    expect(order.total_purchase_cost).toBe(37.5);
    expect(order.total_profit).toBe(22.5);
    expect(order.profit_margin_percentage).toBe(37.5);

    expect(Number.isFinite(order.total_purchase_cost)).toBe(true);
    expect(Number.isFinite(order.total_profit)).toBe(true);
    expect(Number.isFinite(order.profit_margin_percentage)).toBe(true);
  });

  it('should validate profit calculations consistency', async () => {
    const response = await fetch(`${apiUrl}/api/v1/orders`);

    expect(response.status).toBe(200);

    const data = await response.json();

    data.orders.forEach((order) => {
      expect(typeof order.total_purchase_cost).toBe('number');
      expect(typeof order.total_profit).toBe('number');
      expect(typeof order.profit_margin_percentage).toBe('number');

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

      expect(Number.isFinite(order.total_purchase_cost)).toBe(true);
      expect(Number.isFinite(order.total_profit)).toBe(true);
      expect(Number.isFinite(order.profit_margin_percentage)).toBe(true);

      expect(isNaN(order.total_purchase_cost)).toBe(false);
      expect(isNaN(order.total_profit)).toBe(false);
      expect(isNaN(order.profit_margin_percentage)).toBe(false);
    });
  });

  it('should return consistent data types for all numeric fields', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [{ product_id: testProductId, quantity: 1 }],
      discount: 5.0,
      tax: 2.5,
      notes: 'Data types test order',
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

  it('should handle mixed orders with and without profit items', async () => {
    const mixedOrderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        { product_id: testProductId, quantity: 1 },
        { product_id: testProductWithProfitId, quantity: 1 },
      ],
      discount: 5.0,
      notes: 'Mixed profit order',
    };

    const createResponse = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mixedOrderData),
    });

    expect(createResponse.status).toBe(201);
    const createData = await createResponse.json();

    const getResponse = await fetch(`${apiUrl}/api/v1/orders`);
    const getData = await getResponse.json();

    const order = getData.orders.find((o) => o.id === createData.id);
    expect(order).toBeDefined();

    expect(order.subtotal).toBe(65.0);
    expect(order.total_purchase_cost).toBe(25.0);
    expect(order.total_profit).toBe(40.0);
    expect(order.profit_margin_percentage).toBeCloseTo(61.54, 1);
  });

  it('should handle server errors gracefully', async () => {
    const response = await fetch(`${apiUrl}/api/v1/orders`);

    expect([200, 500]).toContain(response.status);

    if (response.status === 500) {
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Failed to fetch orders');
    }
  });

  it('should return orders with client information populated', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [{ product_id: testProductId, quantity: 1 }],
      notes: 'Client info test order',
    };

    const createResponse = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    expect(createResponse.status).toBe(201);

    const response = await fetch(`${apiUrl}/api/v1/orders`);
    const data = await response.json();

    const order = data.orders.find((o) => o.notes === 'Client info test order');
    expect(order).toBeDefined();

    expect(order.client_id).toBe(testClientId);
    expect(order.client_name).toBe('Test Orders Client');
    expect(order.client_establishment_type).toBe('Restaurant');
    expect(order.client_phone).toBe('+1234567890');
  });

  it('should handle empty database gracefully', async () => {
    const response = await fetch(`${apiUrl}/api/v1/orders`);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('orders');
    expect(Array.isArray(data.orders)).toBe(true);

    if (data.orders.length === 0) {
      expect(data.orders).toEqual([]);
    }
  });
});

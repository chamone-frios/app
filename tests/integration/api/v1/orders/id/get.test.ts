import { waitForAllServices } from 'tests/orchestrator';
import { getApiEndpoint } from 'tests/utils';

import {
  CreateOrderRequest,
  ProductMetric,
} from '../../../../../../src/constants/types';

describe('GET /api/v1/orders/[id]', () => {
  let createdOrderId: string;
  let testClientId: string;
  let testProductId: string;
  const apiUrl = getApiEndpoint();

  beforeAll(async () => {
    await waitForAllServices();

    const clientToCreate = {
      name: 'Test Client Get Order By ID',
      establishment_type: 'Restaurant',
      phone: '+1234567890',
      maps_link: 'https://maps.google.com/test-order-by-id',
    };

    const clientResponse = await fetch(`${apiUrl}/api/v1/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientToCreate),
    });

    const clientData = await clientResponse.json();
    testClientId = clientData.id;

    const productToCreate = {
      name: 'Test Product Get Order By ID',
      img: 'test-order-by-id.jpg',
      description: 'Product for testing order get by ID',
      maker: 'Test Maker',
      metric: ProductMetric.UNIT,
      stock: 50,
      price: 75.5,
    };

    const productResponse = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productToCreate),
    });

    const productData = await productResponse.json();
    testProductId = productData.id;

    const orderToCreate: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 2,
        },
      ],
      discount: 10.0,
      tax: 7.5,
      notes: 'Test order for get by ID',
    };

    const orderResponse = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderToCreate),
    });

    const orderData = await orderResponse.json();
    createdOrderId = orderData.id;
  });

  it("should return 404 when order doesn't exist", async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const response = await fetch(`${apiUrl}/api/v1/orders/${nonExistentId}`);

    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Order not found');
  });

  it('should return the specific order when a valid ID is provided', async () => {
    const response = await fetch(`${apiUrl}/api/v1/orders/${createdOrderId}`);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('order');
    expect(data.order).toHaveProperty('id');
    expect(data.order.id).toBe(createdOrderId);
  });

  it('should return the correct order structure', async () => {
    const response = await fetch(`${apiUrl}/api/v1/orders/${createdOrderId}`);

    expect(response.status).toBe(200);

    const data = await response.json();
    const order = data.order;

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
    expect(order).toHaveProperty('items');

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
    expect(typeof order.notes).toBe('string');
    expect(Array.isArray(order.items)).toBe(true);
  });

  it('should return order with correct client information', async () => {
    const response = await fetch(`${apiUrl}/api/v1/orders/${createdOrderId}`);

    expect(response.status).toBe(200);

    const data = await response.json();
    const order = data.order;

    expect(order.client_id).toBe(testClientId);
    expect(order.client_name).toBe('Test Client Get Order By ID');
    expect(order.client_establishment_type).toBe('Restaurant');
    expect(order.client_phone).toBe('+1234567890');
    expect(order.notes).toBe('Test order for get by ID');
    expect(order.status).toBe('pending');
  });

  it('should return order with correct items structure', async () => {
    const response = await fetch(`${apiUrl}/api/v1/orders/${createdOrderId}`);

    expect(response.status).toBe(200);

    const data = await response.json();
    const order = data.order;

    expect(order.items).toBeDefined();
    expect(Array.isArray(order.items)).toBe(true);
    expect(order.items.length).toBe(1);

    const item = order.items[0];

    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('order_id');
    expect(item).toHaveProperty('product_id');
    expect(item).toHaveProperty('product_name');
    expect(item).toHaveProperty('product_description');
    expect(item).toHaveProperty('product_maker');
    expect(item).toHaveProperty('product_metric');
    expect(item).toHaveProperty('product_img');
    expect(item).toHaveProperty('unit_price');
    expect(item).toHaveProperty('quantity');
    expect(item).toHaveProperty('subtotal');
    expect(item).toHaveProperty('created_at');

    expect(typeof item.id).toBe('string');
    expect(typeof item.order_id).toBe('string');
    expect(typeof item.product_id).toBe('string');
    expect(typeof item.product_name).toBe('string');
    expect(typeof item.product_description).toBe('string');
    expect(typeof item.product_maker).toBe('string');
    expect(typeof item.product_metric).toBe('number');
    expect(typeof item.product_img).toBe('string');
    expect(typeof item.unit_price).toBe('number');
    expect(typeof item.quantity).toBe('number');
    expect(typeof item.subtotal).toBe('number');

    expect(item.order_id).toBe(createdOrderId);
    expect(item.product_id).toBe(testProductId);
    expect(item.product_name).toBe('Test Product Get Order By ID');
    expect(item.product_description).toBe(
      'Product for testing order get by ID'
    );
    expect(item.product_maker).toBe('Test Maker');
    expect(item.product_metric).toBe(ProductMetric.UNIT);
    expect(item.quantity).toBe(2);
    expect(item.unit_price).toBe(75.5);
    expect(item.subtotal).toBe(151.0);
  });

  it('should return correct calculated totals', async () => {
    const response = await fetch(`${apiUrl}/api/v1/orders/${createdOrderId}`);

    expect(response.status).toBe(200);

    const data = await response.json();
    const order = data.order;

    expect(order.subtotal).toBe(151.0);
    expect(order.discount).toBe(10.0);
    expect(order.tax).toBe(7.5);
    expect(order.total).toBe(148.5);
  });

  it('should handle order with minimal data', async () => {
    const minimalOrderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 1,
        },
      ],
    };

    const createResponse = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(minimalOrderData),
    });

    const createData = await createResponse.json();
    const minimalOrderId = createData.id;

    const response = await fetch(`${apiUrl}/api/v1/orders/${minimalOrderId}`);

    expect(response.status).toBe(200);

    const data = await response.json();
    const order = data.order;

    expect(order.discount).toBe(0);
    expect(order.tax).toBe(0);
    expect(order.notes).toBeNull();
    expect(order.subtotal).toBe(75.5);
    expect(order.total).toBe(75.5);
  });

  it('should handle invalid order ID format', async () => {
    const invalidId = 'invalid-uuid-format';
    const response = await fetch(`${apiUrl}/api/v1/orders/${invalidId}`);

    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Order not found');
  });

  it('should handle method not allowed', async () => {
    const response = await fetch(`${apiUrl}/api/v1/orders/${createdOrderId}`, {
      method: 'PUT',
    });

    expect(response.status).toBe(405);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Method not allowed');
  });

  it('should preserve product information at order time', async () => {
    const response = await fetch(`${apiUrl}/api/v1/orders/${createdOrderId}`);

    expect(response.status).toBe(200);

    const data = await response.json();
    const order = data.order;
    const item = order.items[0];

    expect(item.product_name).toBe('Test Product Get Order By ID');
    expect(item.product_description).toBe(
      'Product for testing order get by ID'
    );
    expect(item.product_maker).toBe('Test Maker');
    expect(item.product_img).toBe('test-order-by-id.jpg');
    expect(item.unit_price).toBe(75.5);
  });
});

import {
  CreateOrderRequest,
  OrderStatus,
  Product,
  ProductLabel,
  ProductMetric,
} from 'src/constants/types';
import { waitForAllServices } from 'tests/orchestrator';
import { getApiEndpoint } from 'tests/utils';

describe('POST /api/v1/orders/status/[id]', () => {
  let createdOrderId: string;
  let testClientId: string;
  let testProductId: string;
  const apiUrl = getApiEndpoint();

  beforeAll(async () => {
    await waitForAllServices();

    const clientToCreate = {
      name: 'Test Client for Order Status',
      establishment_type: 'Restaurant',
      phone: '+1234567890',
      maps_link: 'https://maps.google.com/test-order-status',
    };

    const clientResponse = await fetch(`${apiUrl}/api/v1/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientToCreate),
    });

    const clientData = await clientResponse.json();
    testClientId = clientData.id;

    const productToCreate: Omit<
      Product,
      'id' | 'profit_margin' | 'purchase_price'
    > = {
      name: 'Test Product for Order Status',
      img: 'test-order-status.jpg',
      description: 'Product for testing order status updates',
      maker: 'Test Maker',
      metric: ProductMetric.UNIT,
      label: ProductLabel.DAIRY,
      stock: 100,
      price: 25.0,
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
      discount: 5.0,
      tax: 2.5,
      notes: 'Test order for status updates',
    };

    const orderResponse = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderToCreate),
    });

    const orderData = await orderResponse.json();
    createdOrderId = orderData.id;
  });

  it('should return 404 when order ID is missing', async () => {
    const response = await fetch(`${apiUrl}/api/v1/orders/status/null`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: OrderStatus.PAID }),
    });

    expect(response.status).toBe(404);
  });

  it('should return 400 when status is missing', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/status/${createdOrderId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }
    );

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('invalid status');
  });

  it('should return 400 when status is invalid', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/status/${createdOrderId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'invalid_status' }),
      }
    );

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('invalid status');
  });

  it('should return 404 when order does not exist', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const response = await fetch(
      `${apiUrl}/api/v1/orders/status/${nonExistentId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: OrderStatus.PAID }),
      }
    );

    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Order not found');
  });

  it('should successfully update order status to PAID', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/status/${createdOrderId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: OrderStatus.PAID }),
      }
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data.success).toBe(true);
    expect(data).toHaveProperty('message');
    expect(data.message).toBe('Order status updated successfully');

    const getOrderResponse = await fetch(
      `${apiUrl}/api/v1/orders/${createdOrderId}`
    );
    const orderData = await getOrderResponse.json();
    expect(orderData.order.status).toBe(OrderStatus.PAID);
  });

  it('should successfully update order status to CANCELLED', async () => {
    const orderToCreate: CreateOrderRequest = {
      client_id: testClientId,
      items: [{ product_id: testProductId, quantity: 1 }],
      notes: 'Order to be cancelled',
    };

    const createResponse = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderToCreate),
    });

    const createData = await createResponse.json();
    const newOrderId = createData.id;

    const response = await fetch(
      `${apiUrl}/api/v1/orders/status/${newOrderId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: OrderStatus.CANCELLED }),
      }
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toBe('Order status updated successfully');

    const getOrderResponse = await fetch(
      `${apiUrl}/api/v1/orders/${newOrderId}`
    );
    const orderData = await getOrderResponse.json();
    expect(orderData.order.status).toBe(OrderStatus.CANCELLED);
  });

  it('should successfully update order status back to PENDING', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/status/${createdOrderId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: OrderStatus.PENDING }),
      }
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);

    const getOrderResponse = await fetch(
      `${apiUrl}/api/v1/orders/${createdOrderId}`
    );
    const orderData = await getOrderResponse.json();
    expect(orderData.order.status).toBe(OrderStatus.PENDING);
  });

  it('should handle PATCH method as not allowed', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/status/${createdOrderId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: OrderStatus.PENDING }),
      }
    );

    expect(response.status).toBe(405);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Method not allowed');
  });

  it('should handle PUT method as not allowed', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/status/${createdOrderId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: OrderStatus.PAID }),
      }
    );

    expect(response.status).toBe(405);

    const data = await response.json();
    expect(data.error).toBe('Method not allowed');
  });

  it('should handle DELETE method as not allowed', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/status/${createdOrderId}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: OrderStatus.PENDING }),
      }
    );

    expect(response.status).toBe(405);

    const data = await response.json();
    expect(data.error).toBe('Method not allowed');
  });

  it('should handle multiple status updates on the same order', async () => {
    const paidResponse = await fetch(
      `${apiUrl}/api/v1/orders/status/${createdOrderId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: OrderStatus.PAID }),
      }
    );
    expect(paidResponse.status).toBe(200);

    const cancelledResponse = await fetch(
      `${apiUrl}/api/v1/orders/status/${createdOrderId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: OrderStatus.CANCELLED }),
      }
    );
    expect(cancelledResponse.status).toBe(200);

    const getOrderResponse = await fetch(
      `${apiUrl}/api/v1/orders/${createdOrderId}`
    );
    const orderData = await getOrderResponse.json();
    expect(orderData.order.status).toBe(OrderStatus.CANCELLED);
  });

  it('should validate OrderStatus enum values correctly', async () => {
    const validStatuses = [
      OrderStatus.PENDING,
      OrderStatus.PAID,
      OrderStatus.CANCELLED,
    ];

    for (const status of validStatuses) {
      const response = await fetch(
        `${apiUrl}/api/v1/orders/status/${createdOrderId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        }
      );
      expect(response.status).toBe(200);
    }

    const invalidStatuses = [
      'processing',
      'shipped',
      'delivered',
      'refunded',
      '',
    ];

    for (const status of invalidStatuses) {
      const response = await fetch(
        `${apiUrl}/api/v1/orders/status/${createdOrderId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        }
      );
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe('invalid status');
    }
  });

  it('should handle empty request body', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/status/${createdOrderId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '',
      }
    );

    expect(response.status).toBe(400);
  });

  it('should handle malformed JSON in request body', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/status/${createdOrderId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ invalid json }',
      }
    );

    expect(response.status).toBe(400);
  });

  it('should handle null status value', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/status/${createdOrderId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: null }),
      }
    );

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('invalid status');
  });

  it('should handle undefined status value', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/status/${createdOrderId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: undefined }),
      }
    );

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('invalid status');
  });

  it('should verify status persistence across different requests', async () => {
    await fetch(`${apiUrl}/api/v1/orders/status/${createdOrderId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: OrderStatus.PAID }),
    });

    const getResponse1 = await fetch(
      `${apiUrl}/api/v1/orders/${createdOrderId}`
    );
    const orderData1 = await getResponse1.json();
    expect(orderData1.order.status).toBe(OrderStatus.PAID);

    await fetch(`${apiUrl}/api/v1/orders/status/${createdOrderId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: OrderStatus.CANCELLED }),
    });

    const getResponse2 = await fetch(
      `${apiUrl}/api/v1/orders/${createdOrderId}`
    );
    const orderData2 = await getResponse2.json();
    expect(orderData2.order.status).toBe(OrderStatus.CANCELLED);
  });
});

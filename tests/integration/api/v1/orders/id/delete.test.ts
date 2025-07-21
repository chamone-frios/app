import { CreateOrderRequest, Order, ProductMetric } from 'src/constants/types';
import { waitForAllServices } from 'tests/orchestrator';
import { getApiEndpoint } from 'tests/utils';

describe('DELETE /api/v1/orders/[id]', () => {
  let testClientId: string;
  let testProductId: string;
  let testProductWithProfitId: string;
  const apiUrl = getApiEndpoint();

  beforeAll(async () => {
    await waitForAllServices();

    const clientData = {
      name: 'Test Delete Order Client',
      establishment_type: 'Restaurant',
      phone: '+1234567890',
      maps_link: 'https://maps.google.com/test-delete-order-client',
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
      name: 'Test Delete Order Product',
      img: 'test-delete-order-product.jpg',
      description: 'Product for delete order testing',
      maker: 'Test Maker',
      metric: ProductMetric.UNIT,
      stock: 100.5,
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

    const productWithProfitData = {
      name: 'Test Delete Order Product With Profit',
      img: 'test-delete-order-product-profit.jpg',
      description: 'Product with profit for delete order testing',
      maker: 'Profit Maker',
      metric: ProductMetric.KG,
      stock: 50.25,
      price: 80.0,
      purchase_price: 50.0,
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

  const createTestOrder = async (
    orderData: CreateOrderRequest
  ): Promise<string> => {
    const response = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    expect(response.status).toBe(201);
    const responseData = await response.json();
    return responseData.id;
  };

  it('should successfully delete an existing order', async () => {
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
      notes: 'Test order for deletion',
    };

    const orderId = await createTestOrder(orderData);

    const getBeforeResponse = await fetch(`${apiUrl}/api/v1/orders/${orderId}`);
    expect(getBeforeResponse.status).toBe(200);

    const deleteResponse = await fetch(`${apiUrl}/api/v1/orders/${orderId}`, {
      method: 'DELETE',
    });

    expect(deleteResponse.status).toBe(200);

    const deleteResponseData = await deleteResponse.json();
    expect(deleteResponseData).toHaveProperty('order');
    expect(deleteResponseData.order).toBeNull();

    const getAfterResponse = await fetch(`${apiUrl}/api/v1/orders/${orderId}`);
    expect(getAfterResponse.status).toBe(404);

    const getAfterData = await getAfterResponse.json();
    expect(getAfterData.error).toBe('Order not found');
  });

  it('should delete order with minimal required fields', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 1,
        },
      ],
    };

    const orderId = await createTestOrder(orderData);

    const deleteResponse = await fetch(`${apiUrl}/api/v1/orders/${orderId}`, {
      method: 'DELETE',
    });

    expect(deleteResponse.status).toBe(200);

    const deleteResponseData = await deleteResponse.json();
    expect(deleteResponseData).toHaveProperty('order');
    expect(deleteResponseData.order).toBeNull();
  });

  it('should delete order with decimal quantities and profit calculations', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductWithProfitId,
          quantity: 2.5,
        },
      ],
      discount: 10.0,
      notes: 'Order with decimal quantity for deletion',
    };

    const orderId = await createTestOrder(orderData);

    const getBeforeResponse = await fetch(`${apiUrl}/api/v1/orders/${orderId}`);
    const getBeforeData = await getBeforeResponse.json();
    const order = getBeforeData.order;

    expect(order.subtotal).toBe(200.0);
    expect(order.total_purchase_cost).toBe(125.0);
    expect(order.total_profit).toBe(75.0);

    const deleteResponse = await fetch(`${apiUrl}/api/v1/orders/${orderId}`, {
      method: 'DELETE',
    });

    expect(deleteResponse.status).toBe(200);

    const getAfterResponse = await fetch(`${apiUrl}/api/v1/orders/${orderId}`);
    expect(getAfterResponse.status).toBe(404);
  });

  it('should delete order with mixed profit and non-profit items', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 1,
        },
        {
          product_id: testProductWithProfitId,
          quantity: 1,
        },
      ],
      discount: 5.0,
      notes: 'Mixed profit order for deletion',
    };

    const orderId = await createTestOrder(orderData);

    const getBeforeResponse = await fetch(`${apiUrl}/api/v1/orders/${orderId}`);
    const getBeforeData = await getBeforeResponse.json();
    const order = getBeforeData.order;

    expect(order.subtotal).toBe(130.0);
    expect(order.total_purchase_cost).toBe(50.0);
    expect(order.total_profit).toBe(80.0);

    const deleteResponse = await fetch(`${apiUrl}/api/v1/orders/${orderId}`, {
      method: 'DELETE',
    });

    expect(deleteResponse.status).toBe(200);

    const getAfterResponse = await fetch(`${apiUrl}/api/v1/orders/${orderId}`);
    expect(getAfterResponse.status).toBe(404);
  });

  it('should delete order with multiple items and complex calculations', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 1.5,
        },
        {
          product_id: testProductWithProfitId,
          quantity: 2.25,
        },
      ],
      discount: 10.0,
      tax: 8.0,
      notes: 'Multi-item profit test for deletion',
    };

    const orderId = await createTestOrder(orderData);

    const getBeforeResponse = await fetch(`${apiUrl}/api/v1/orders/${orderId}`);
    const getBeforeData = await getBeforeResponse.json();
    const order = getBeforeData.order;

    expect(order.subtotal).toBe(255.0);
    expect(order.total_purchase_cost).toBe(112.5);
    expect(order.total_profit).toBe(142.5);
    expect(order.items.length).toBe(2);

    const deleteResponse = await fetch(`${apiUrl}/api/v1/orders/${orderId}`, {
      method: 'DELETE',
    });

    expect(deleteResponse.status).toBe(200);

    const getAfterResponse = await fetch(`${apiUrl}/api/v1/orders/${orderId}`);
    expect(getAfterResponse.status).toBe(404);
  });

  it('should return 200 when trying to delete a non-existent order', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    const response = await fetch(`${apiUrl}/api/v1/orders/${nonExistentId}`, {
      method: 'DELETE',
    });

    expect(response.status).toBe(200);

    const responseData = await response.json();
    expect(responseData).toHaveProperty('order');
    expect(responseData.order).toBeNull();
  });

  it('should return 404 when order ID is invalid format', async () => {
    const invalidId = 'invalid-uuid-format';

    const response = await fetch(`${apiUrl}/api/v1/orders/${invalidId}`, {
      method: 'DELETE',
    });

    expect(response.status).toBe(404);

    const responseData = await response.json();
    expect(responseData.error).toBe('Order not found');
  });

  it('should return 400 when order ID is missing', async () => {
    const response = await fetch(`${apiUrl}/api/v1/orders/`, {
      method: 'DELETE',
    });

    expect([400, 404, 405]).toContain(response.status);
  });

  it('should handle duplicate deletion attempts', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 1,
        },
      ],
      notes: 'Order for duplicate deletion test',
    };

    const orderId = await createTestOrder(orderData);

    const firstDeleteResponse = await fetch(
      `${apiUrl}/api/v1/orders/${orderId}`,
      {
        method: 'DELETE',
      }
    );

    expect(firstDeleteResponse.status).toBe(200);

    const secondDeleteResponse = await fetch(
      `${apiUrl}/api/v1/orders/${orderId}`,
      {
        method: 'DELETE',
      }
    );

    expect(secondDeleteResponse.status).toBe(200);

    const secondDeleteData = await secondDeleteResponse.json();
    expect(secondDeleteData).toHaveProperty('order');
    expect(secondDeleteData.order).toBeNull();
  });

  it('should delete order and verify it disappears from orders list', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 1,
        },
      ],
      notes: 'Order for list verification test',
    };

    const orderId = await createTestOrder(orderData);

    const getListBeforeResponse = await fetch(`${apiUrl}/api/v1/orders`);
    const getListBeforeData = await getListBeforeResponse.json();

    const orderInListBefore = getListBeforeData.orders.find(
      (o: Order) => o.id === orderId
    );
    expect(orderInListBefore).toBeDefined();
    expect(orderInListBefore.notes).toBe('Order for list verification test');

    const deleteResponse = await fetch(`${apiUrl}/api/v1/orders/${orderId}`, {
      method: 'DELETE',
    });

    expect(deleteResponse.status).toBe(200);

    const getListAfterResponse = await fetch(`${apiUrl}/api/v1/orders`);
    const getListAfterData = await getListAfterResponse.json();

    const orderInListAfter = getListAfterData.orders.find(
      (o: Order) => o.id === orderId
    );
    expect(orderInListAfter).toBeUndefined();
  });

  it('should delete order and verify it disappears from client orders', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 1,
        },
      ],
      notes: 'Order for client verification test',
    };

    const orderId = await createTestOrder(orderData);

    const getClientOrdersBeforeResponse = await fetch(
      `${apiUrl}/api/v1/orders/client/${testClientId}`
    );
    const getClientOrdersBeforeData =
      await getClientOrdersBeforeResponse.json();

    const orderInClientListBefore = getClientOrdersBeforeData.orders.find(
      (o: Order) => o.id === orderId
    );
    expect(orderInClientListBefore).toBeDefined();

    const deleteResponse = await fetch(`${apiUrl}/api/v1/orders/${orderId}`, {
      method: 'DELETE',
    });

    expect(deleteResponse.status).toBe(200);

    const getClientOrdersAfterResponse = await fetch(
      `${apiUrl}/api/v1/orders/client/${testClientId}`
    );
    const getClientOrdersAfterData = await getClientOrdersAfterResponse.json();

    const orderInClientListAfter = getClientOrdersAfterData.orders.find(
      (o: Order) => o.id === orderId
    );
    expect(orderInClientListAfter).toBeUndefined();
  });

  it('should return 405 for non-allowed methods', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 1,
        },
      ],
    };

    const orderId = await createTestOrder(orderData);

    const response = await fetch(`${apiUrl}/api/v1/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: 'data' }),
    });

    expect(response.status).toBe(405);

    const responseData = await response.json();
    expect(responseData.error).toBe('Method not allowed');

    const getResponse = await fetch(`${apiUrl}/api/v1/orders/${orderId}`);
    expect(getResponse.status).toBe(200);
  });

  it('should handle server errors gracefully', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 1,
        },
      ],
    };

    const orderId = await createTestOrder(orderData);

    const response = await fetch(`${apiUrl}/api/v1/orders/${orderId}`, {
      method: 'DELETE',
    });

    expect([200, 500]).toContain(response.status);

    if (response.status === 500) {
      const data = await response.json();
      expect(data).toHaveProperty('error');
    }
  });

  it('should validate response structure for successful deletion', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 1,
        },
      ],
      discount: 5.0,
      tax: 2.0,
      notes: 'Structure validation test',
    };

    const orderId = await createTestOrder(orderData);

    const response = await fetch(`${apiUrl}/api/v1/orders/${orderId}`, {
      method: 'DELETE',
    });

    expect(response.status).toBe(200);

    const responseData = await response.json();

    expect(responseData).toHaveProperty('order');
    expect(responseData.order).toBeNull();

    expect(Object.keys(responseData)).toEqual(['order']);
  });

  it('should handle deletion of orders with different statuses', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 1,
        },
      ],
      notes: 'Order with pending status for deletion',
    };

    const orderId = await createTestOrder(orderData);

    const getBeforeResponse = await fetch(`${apiUrl}/api/v1/orders/${orderId}`);
    const getBeforeData = await getBeforeResponse.json();
    expect(getBeforeData.order.status).toBe('pending');

    const deleteResponse = await fetch(`${apiUrl}/api/v1/orders/${orderId}`, {
      method: 'DELETE',
    });

    expect(deleteResponse.status).toBe(200);

    const getAfterResponse = await fetch(`${apiUrl}/api/v1/orders/${orderId}`);
    expect(getAfterResponse.status).toBe(404);
  });

  it('should handle special characters in order ID gracefully', async () => {
    const specialCharId = 'order-with-special-chars-@#$%';

    const response = await fetch(
      `${apiUrl}/api/v1/orders/${encodeURIComponent(specialCharId)}`,
      {
        method: 'DELETE',
      }
    );

    expect([400, 404]).toContain(response.status);

    const responseData = await response.json();
    expect(responseData).toHaveProperty('error');
  });

  it('should handle concurrent deletion attempts', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 1,
        },
      ],
      notes: 'Order for concurrent deletion test',
    };

    const orderId = await createTestOrder(orderData);

    const [response1, response2] = await Promise.all([
      fetch(`${apiUrl}/api/v1/orders/${orderId}`, { method: 'DELETE' }),
      fetch(`${apiUrl}/api/v1/orders/${orderId}`, { method: 'DELETE' }),
    ]);

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);

    const getResponse = await fetch(`${apiUrl}/api/v1/orders/${orderId}`);
    expect(getResponse.status).toBe(404);
  });

  it('should verify idempotent behavior of deletion', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 1,
        },
      ],
      notes: 'Order for idempotent deletion test',
    };

    const orderId = await createTestOrder(orderData);

    for (let i = 0; i < 3; i++) {
      const deleteResponse = await fetch(`${apiUrl}/api/v1/orders/${orderId}`, {
        method: 'DELETE',
      });

      expect(deleteResponse.status).toBe(200);

      const deleteResponseData = await deleteResponse.json();
      expect(deleteResponseData).toHaveProperty('order');
      expect(deleteResponseData.order).toBeNull();
    }

    const getResponse = await fetch(`${apiUrl}/api/v1/orders/${orderId}`);
    expect(getResponse.status).toBe(404);
  });
});

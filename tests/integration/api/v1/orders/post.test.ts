import { CreateOrderRequest, ProductMetric } from 'src/constants/types';
import { waitForAllServices } from 'tests/orchestrator';
import { getApiEndpoint } from 'tests/utils';

describe('POST /api/v1/orders', () => {
  let testClientId: string;
  let testProductId: string;
  let testProductWithProfitId: string;
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
      name: 'Test Order Product With Profit',
      img: 'test-order-product-profit.jpg',
      description: 'Product with profit for order testing',
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

  it('should create an order with decimal quantities', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductWithProfitId,
          quantity: 2.5,
        },
      ],
      discount: 10.0,
      notes: 'Order with decimal quantity',
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

  it('should create an order with profit calculations for products with purchase_price', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductWithProfitId,
          quantity: 2,
        },
      ],
      discount: 15.0,
      tax: 5.0,
      notes: 'Order with profit calculations',
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

    const getResponse = await fetch(
      `${apiUrl}/api/v1/orders/${responseData.id}`
    );
    const getResponseData = await getResponse.json();
    const order = getResponseData.order;

    expect(order.subtotal).toBe(160.0);
    expect(order.total_purchase_cost).toBe(100.0);
    expect(order.total_profit).toBe(60.0);
    expect(order.profit_margin_percentage).toBe(37.5);
  });

  it('should create an order with mixed profit and non-profit items', async () => {
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
      notes: 'Mixed profit order',
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

    const getResponse = await fetch(
      `${apiUrl}/api/v1/orders/${responseData.id}`
    );
    const getResponseData = await getResponse.json();
    const order = getResponseData.order;

    expect(order.subtotal).toBe(130.0);
    expect(order.total_purchase_cost).toBe(50.0);
    expect(order.total_profit).toBe(80.0);
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
      'Invalid quantity for item at index 0 (must be a positive number)'
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
      'Invalid quantity for item at index 0 (must be a positive number)'
    );
  });

  it('should handle decimal quantities validation correctly', async () => {
    const validDecimalOrderData = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductWithProfitId,
          quantity: 1.5,
        },
      ],
    };

    const validResponse = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validDecimalOrderData),
    });

    expect(validResponse.status).toBe(201);

    const negativeOrderData = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: -1.5,
        },
      ],
    };

    const negativeResponse = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(negativeOrderData),
    });

    expect(negativeResponse.status).toBe(400);

    const negativeResponseData = await negativeResponse.json();
    expect(negativeResponseData.error).toBe(
      'Invalid quantity for item at index 0 (must be a positive number)'
    );
  });

  it('should return 400 when discount is invalid', async () => {
    const orderDataNegativeDiscount = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 1,
        },
      ],
      discount: -5,
    };

    const response1 = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderDataNegativeDiscount),
    });

    expect(response1.status).toBe(400);

    const responseData1 = await response1.json();
    expect(responseData1.error).toBe(
      'Invalid discount value (must be a non-negative finite number)'
    );

    const orderDataInfiniteDiscount = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 1,
        },
      ],
      discount: Infinity,
    };

    const response2 = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderDataInfiniteDiscount),
    });

    expect(response2.status).toBe(400);

    const responseData2 = await response2.json();
    expect(responseData2.error).toBe(
      'Invalid discount value (must be a non-negative finite number)'
    );
  });

  it('should return 400 when tax is invalid', async () => {
    const orderDataNegativeTax = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 1,
        },
      ],
      tax: -10,
    };

    const response1 = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderDataNegativeTax),
    });

    expect(response1.status).toBe(400);

    const responseData1 = await response1.json();
    expect(responseData1.error).toBe(
      'Invalid tax value (must be a non-negative finite number)'
    );

    const orderDataInfiniteTax = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 1,
        },
      ],
      tax: Infinity,
    };

    const response2 = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderDataInfiniteTax),
    });

    expect(response2.status).toBe(400);

    const responseData2 = await response2.json();
    expect(responseData2.error).toBe(
      'Invalid tax value (must be a non-negative finite number)'
    );
  });

  it('should return 400 when notes is not a string', async () => {
    const orderData = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 1,
        },
      ],
      notes: 123,
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
    expect(responseData.error).toBe('Invalid notes value (must be a string)');
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

  it('should handle insufficient stock with decimal quantities', async () => {
    const orderData = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductWithProfitId,
          quantity: 100.5,
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
    expect(responseData.error).toContain('Test Order Product With Profit');
  });

  it('should properly update stock after order creation', async () => {
    const initialStockResponse = await fetch(
      `${apiUrl}/api/v1/products/${testProductId}`
    );
    const initialStockData = await initialStockResponse.json();
    const initialStock = initialStockData.product.stock;

    const orderData = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 2.5,
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

    const finalStockResponse = await fetch(
      `${apiUrl}/api/v1/products/${testProductId}`
    );
    const finalStockData = await finalStockResponse.json();
    const finalStock = finalStockData.product.stock;

    expect(finalStock).toBe(initialStock - 2.5);
  });

  it('should handle multiple items with different profit configurations', async () => {
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
      notes: 'Multi-item profit test',
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

    const getResponse = await fetch(
      `${apiUrl}/api/v1/orders/${responseData.id}`
    );
    const getResponseData = await getResponse.json();
    const order = getResponseData.order;

    expect(order.subtotal).toBe(255.0);
    expect(order.total_purchase_cost).toBe(112.5);
    expect(order.total_profit).toBe(142.5);
    expect(order.total).toBe(253.0);

    expect(order.items.length).toBe(2);

    const item1 = order.items.find((item) => item.product_id === testProductId);
    const item2 = order.items.find(
      (item) => item.product_id === testProductWithProfitId
    );

    expect(item1.unit_purchase_price).toBe(0);
    expect(item1.unit_profit).toBe(50);
    expect(item1.total_profit).toBe(75);

    expect(item2.unit_purchase_price).toBe(50);
    expect(item2.unit_profit).toBe(30);
    expect(item2.total_profit).toBe(67.5);
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

  it('should handle transaction rollback on error', async () => {
    const initialStockResponse = await fetch(
      `${apiUrl}/api/v1/products/${testProductId}`
    );
    const initialStockData = await initialStockResponse.json();
    const initialStock = initialStockData.product.stock;

    const orderData = {
      client_id: '00000000-0000-0000-0000-000000000000',
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

    const finalStockResponse = await fetch(
      `${apiUrl}/api/v1/products/${testProductId}`
    );
    const finalStockData = await finalStockResponse.json();
    const finalStock = finalStockData.product.stock;

    expect(finalStock).toBe(initialStock);
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

    const response = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    expect([201, 500]).toContain(response.status);

    if (response.status === 500) {
      const data = await response.json();
      expect(data).toHaveProperty('error');
    }
  });

  it('should validate response structure for successful order creation', async () => {
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

    const response = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    expect(response.status).toBe(201);

    const responseData = await response.json();

    expect(responseData).toHaveProperty('success');
    expect(responseData).toHaveProperty('id');

    expect(responseData.success).toBe(true);
    expect(typeof responseData.id).toBe('string');

    expect(responseData.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });
});

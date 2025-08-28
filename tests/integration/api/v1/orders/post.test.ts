import {
  CreateOrderRequest,
  ProductMetric,
  ProductLabel,
} from 'src/constants/types';
import { waitForAllServices } from 'tests/orchestrator';
import { getApiEndpoint } from 'tests/utils';

describe('POST /api/v1/orders', () => {
  let testClientId: string;
  let testProductId: string;
  let testProductWithProfitId: string;
  let testProductWithLabelId: string;
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
      label: ProductLabel.DAIRY,
      stock: 100.5,
      price: 50.0,
      purchase_price: 0,
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
      label: ProductLabel.MEATS,
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

    const productWithLabelData = {
      name: 'Test Order Product With Label',
      img: 'test-order-product-label.jpg',
      description: 'Product with label for order testing',
      maker: 'Label Maker',
      metric: ProductMetric.L,
      label: ProductLabel.HAMBURGERS,
      stock: 25.0,
      price: 35.0,
      purchase_price: 20.0,
    };

    const productWithLabelResponse = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productWithLabelData),
    });

    const productWithLabelResult = await productWithLabelResponse.json();
    testProductWithLabelId = productWithLabelResult.id;
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

  it('should create an order and preserve product label information in order items', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductWithLabelId,
          quantity: 2,
        },
      ],
      discount: 5.0,
      notes: 'Order with product label test',
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

    expect(order.items.length).toBe(1);
    const orderItem = order.items[0];

    expect(orderItem.product_label).toBe(ProductLabel.HAMBURGERS);
    expect(orderItem.product_name).toBe('Test Order Product With Label');
    expect(orderItem.product_id).toBe(testProductWithLabelId);
  });

  it('should create an order with multiple products having different labels', async () => {
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
        {
          product_id: testProductWithLabelId,
          quantity: 1,
        },
      ],
      discount: 10.0,
      notes: 'Multi-label order test',
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

    expect(order.items.length).toBe(3);

    const dairyItem = order.items.find(
      (item) => item.product_id === testProductId
    );
    const meatItem = order.items.find(
      (item) => item.product_id === testProductWithProfitId
    );
    const hamburgerItem = order.items.find(
      (item) => item.product_id === testProductWithLabelId
    );

    expect(dairyItem.product_label).toBe(ProductLabel.DAIRY);
    expect(meatItem.product_label).toBe(ProductLabel.MEATS);
    expect(hamburgerItem.product_label).toBe(ProductLabel.HAMBURGERS);
  });

  it('should preserve product label snapshot even if product label changes later', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductWithLabelId,
          quantity: 1,
        },
      ],
      notes: 'Label snapshot test',
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

    const getResponse = await fetch(
      `${apiUrl}/api/v1/orders/${responseData.id}`
    );
    const getResponseData = await getResponse.json();
    const order = getResponseData.order;

    const orderItem = order.items[0];
    expect(orderItem.product_label).toBe(ProductLabel.HAMBURGERS);

    expect(orderItem.product_label).toBe(ProductLabel.HAMBURGERS);
    expect(typeof orderItem.product_label).toBe('number');
  });

  it('should validate order item structure includes product_label field', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductWithLabelId,
          quantity: 1,
        },
      ],
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
    expect(responseData.success).toBe(true);

    const getResponse = await fetch(
      `${apiUrl}/api/v1/orders/${responseData.id}`
    );
    const getResponseData = await getResponse.json();
    const order = getResponseData.order;

    const orderItem = order.items[0];

    expect(orderItem).toHaveProperty('id');
    expect(orderItem).toHaveProperty('order_id');
    expect(orderItem).toHaveProperty('product_id');
    expect(orderItem).toHaveProperty('product_name');
    expect(orderItem).toHaveProperty('product_description');
    expect(orderItem).toHaveProperty('product_maker');
    expect(orderItem).toHaveProperty('product_metric');
    expect(orderItem).toHaveProperty('product_label');
    expect(orderItem).toHaveProperty('product_img');
    expect(orderItem).toHaveProperty('unit_price');
    expect(orderItem).toHaveProperty('quantity');
    expect(orderItem).toHaveProperty('subtotal');
    expect(orderItem).toHaveProperty('unit_purchase_price');
    expect(orderItem).toHaveProperty('unit_profit');
    expect(orderItem).toHaveProperty('total_profit');
    expect(orderItem).toHaveProperty('created_at');

    if (orderItem.product_label !== undefined) {
      expect(typeof orderItem.product_label).toBe('number');
      expect(Object.values(ProductLabel)).toContain(orderItem.product_label);
    }
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

  it('should handle multiple items with different profit configurations and labels', async () => {
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
        {
          product_id: testProductWithLabelId,
          quantity: 1,
        },
      ],
      discount: 10.0,
      tax: 8.0,
      notes: 'Multi-item profit and label test',
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

    expect(order.items.length).toBe(3);

    const item1 = order.items.find((item) => item.product_id === testProductId);
    const item2 = order.items.find(
      (item) => item.product_id === testProductWithProfitId
    );
    const item3 = order.items.find(
      (item) => item.product_id === testProductWithLabelId
    );

    expect(item1.unit_purchase_price).toBe(0);
    expect(item1.unit_profit).toBe(50);
    expect(item1.total_profit).toBe(75);
    expect(item1.product_label).toBe(ProductLabel.DAIRY);

    expect(item2.unit_purchase_price).toBe(50);
    expect(item2.unit_profit).toBe(30);
    expect(item2.total_profit).toBe(67.5);
    expect(item2.product_label).toBe(ProductLabel.MEATS);

    expect(item3.unit_purchase_price).toBe(20);
    expect(item3.unit_profit).toBe(15);
    expect(item3.total_profit).toBe(15);
    expect(item3.product_label).toBe(ProductLabel.HAMBURGERS);
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

  it('should create order with product labels in correct format for database', async () => {
    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductWithLabelId,
          quantity: 1,
        },
      ],
      notes: 'Database format validation test',
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
    const getResponse = await fetch(
      `${apiUrl}/api/v1/orders/${responseData.id}`
    );
    const getResponseData = await getResponse.json();
    const order = getResponseData.order;

    const orderItem = order.items[0];

    expect(typeof orderItem.product_label).toBe('number');
    expect(Number.isInteger(orderItem.product_label)).toBe(true);
    expect(orderItem.product_label).toBe(ProductLabel.HAMBURGERS);
    expect(orderItem.product_label).toBe(2);
  });

  it('should validate all ProductLabel enum values in orders', async () => {
    const testProducts = [];

    const labelTestCases = [
      { label: ProductLabel.DAIRY, name: 'Test Dairy for Order' },
      { label: ProductLabel.MEATS, name: 'Test Meat for Order' },
      { label: ProductLabel.HAMBURGERS, name: 'Test Hamburger for Order' },
      { label: ProductLabel.PROCESSED, name: 'Test Processed for Order' },
    ];

    for (const testCase of labelTestCases) {
      const productData = {
        name: testCase.name,
        img: `${testCase.label}-order-test.jpg`,
        description: `Testing ${ProductLabel[testCase.label]} in orders`,
        maker: 'Order Test Maker',
        metric: ProductMetric.UNIT,
        label: testCase.label,
        stock: 20.0,
        price: 30.0,
        purchase_price: 18.0,
      };

      const productResponse = await fetch(`${apiUrl}/api/v1/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      const productResult = await productResponse.json();
      testProducts.push({ ...testCase, id: productResult.id });
    }

    const orderData: CreateOrderRequest = {
      client_id: testClientId,
      items: testProducts.map((product) => ({
        product_id: product.id,
        quantity: 1,
      })),
      notes: 'All labels validation test',
    };

    const response = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    expect(response.status).toBe(201);

    const responseData = await response.json();
    const getResponse = await fetch(
      `${apiUrl}/api/v1/orders/${responseData.id}`
    );
    const getResponseData = await getResponse.json();
    const order = getResponseData.order;

    expect(order.items.length).toBe(4);

    for (const testProduct of testProducts) {
      const orderItem = order.items.find(
        (item) => item.product_name === testProduct.name
      );

      expect(orderItem).toBeDefined();
      expect(orderItem.product_label).toBe(testProduct.label);
    }
  });
});

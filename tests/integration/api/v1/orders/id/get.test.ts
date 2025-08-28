import { waitForAllServices } from 'tests/orchestrator';
import { getApiEndpoint } from 'tests/utils';

import {
  CreateOrderRequest,
  ProductMetric,
  ProductLabel,
} from '../../../../../../src/constants/types';

describe('GET /api/v1/orders/[id]', () => {
  let createdOrderId: string;
  let createdOrderWithProfitId: string;
  let createdOrderWithLabelId: string;
  let testClientId: string;
  let testProductId: string;
  let testProductWithProfitId: string;
  let testProductWithLabelId: string;
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
      label: ProductLabel.DAIRY,
      stock: 50.5,
      price: 75.5,
      purchase_price: 0,
    };

    const productResponse = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productToCreate),
    });

    const productData = await productResponse.json();
    testProductId = productData.id;

    const productWithProfitToCreate = {
      name: 'Test Product With Profit Get Order By ID',
      img: 'test-profit-order-by-id.jpg',
      description: 'Product with profit for testing order get by ID',
      maker: 'Profit Maker',
      metric: ProductMetric.KG,
      label: ProductLabel.MEATS,
      stock: 25.75,
      price: 100.0,
      purchase_price: 60.0,
    };

    const productWithProfitResponse = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productWithProfitToCreate),
    });

    const productWithProfitData = await productWithProfitResponse.json();
    testProductWithProfitId = productWithProfitData.id;

    const productWithLabelToCreate = {
      name: 'Test Product With Label Get Order By ID',
      img: 'test-label-order-by-id.jpg',
      description: 'Product with label for testing order get by ID',
      maker: 'Label Maker',
      metric: ProductMetric.L,
      label: ProductLabel.HAMBURGERS,
      stock: 20.0,
      price: 45.0,
      purchase_price: 30.0,
    };

    const productWithLabelResponse = await fetch(`${apiUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productWithLabelToCreate),
    });

    const productWithLabelData = await productWithLabelResponse.json();
    testProductWithLabelId = productWithLabelData.id;

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

    const orderWithProfitToCreate: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductWithProfitId,
          quantity: 1.5,
        },
      ],
      discount: 20.0,
      tax: 15.0,
      notes: 'Test order with profit for get by ID',
    };

    const orderWithProfitResponse = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderWithProfitToCreate),
    });

    const orderWithProfitData = await orderWithProfitResponse.json();
    createdOrderWithProfitId = orderWithProfitData.id;

    const orderWithLabelToCreate: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductWithLabelId,
          quantity: 2,
        },
      ],
      discount: 5.0,
      tax: 3.0,
      notes: 'Test order with label for get by ID',
    };

    const orderWithLabelResponse = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderWithLabelToCreate),
    });

    const orderWithLabelData = await orderWithLabelResponse.json();
    createdOrderWithLabelId = orderWithLabelData.id;
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

  it('should return the correct order structure with profit fields', async () => {
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
    expect(typeof order.notes).toBe('string');
    expect(Array.isArray(order.items)).toBe(true);

    expect(typeof order.total_purchase_cost).toBe('number');
    expect(typeof order.total_profit).toBe('number');
    expect(typeof order.profit_margin_percentage).toBe('number');

    expect(order.total_purchase_cost).toBeGreaterThanOrEqual(0);
    expect(order.total_profit).toBeGreaterThanOrEqual(0);
    expect(order.profit_margin_percentage).toBeGreaterThanOrEqual(0);
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

  it('should return order items with correct structure including profit and label fields', async () => {
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
    expect(item).toHaveProperty('product_label');
    expect(item).toHaveProperty('product_img');
    expect(item).toHaveProperty('unit_price');
    expect(item).toHaveProperty('quantity');
    expect(item).toHaveProperty('subtotal');
    expect(item).toHaveProperty('created_at');

    expect(item).toHaveProperty('unit_purchase_price');
    expect(item).toHaveProperty('unit_profit');
    expect(item).toHaveProperty('total_profit');

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

    expect(typeof item.unit_purchase_price).toBe('number');
    expect(typeof item.unit_profit).toBe('number');
    expect(typeof item.total_profit).toBe('number');

    expect(typeof item.product_label).toBe('number');
    expect(item.product_label).toBe(ProductLabel.DAIRY);

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

    expect(item.unit_purchase_price).toBe(0);
    expect(item.unit_profit).toBe(75.5);
    expect(item.total_profit).toBe(151.0);
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

    expect(order.total_purchase_cost).toBe(0);
    expect(order.total_profit).toBe(151.0);
    expect(order.profit_margin_percentage).toBe(100);
  });

  it('should handle order with profit items correctly', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/${createdOrderWithProfitId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    const order = data.order;
    const item = order.items[0];

    expect(item.unit_purchase_price).toBe(60.0);
    expect(item.unit_profit).toBe(40.0);
    expect(item.total_profit).toBe(60.0);
    expect(item.product_label).toBe(ProductLabel.MEATS);

    expect(order.subtotal).toBe(150.0);
    expect(order.total_purchase_cost).toBe(90.0);
    expect(order.total_profit).toBe(60.0);
    expect(order.profit_margin_percentage).toBe(40.0);

    expect(order.total).toBe(145.0);
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

    expect(order.total_purchase_cost).toBe(0);
    expect(order.total_profit).toBe(75.5);
    expect(order.profit_margin_percentage).toBe(100);

    const item = order.items[0];
    expect(item.product_label).toBe(ProductLabel.DAIRY);
  });

  it('should preserve product label information at order time', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/${createdOrderWithLabelId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    const order = data.order;
    const item = order.items[0];

    expect(item.product_label).toBe(ProductLabel.HAMBURGERS);
    expect(item.product_name).toBe('Test Product With Label Get Order By ID');
    expect(item.product_maker).toBe('Label Maker');
    expect(item.unit_price).toBe(45.0);
    expect(item.quantity).toBe(2);
    expect(item.subtotal).toBe(90.0);
  });

  it('should handle order with multiple items having different labels', async () => {
    const multiLabelOrderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        { product_id: testProductId, quantity: 1 },
        { product_id: testProductWithProfitId, quantity: 1 },
        { product_id: testProductWithLabelId, quantity: 1 },
      ],
      notes: 'Multi-label order test',
    };

    const createResponse = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(multiLabelOrderData),
    });

    const createData = await createResponse.json();
    const multiLabelOrderId = createData.id;

    const response = await fetch(
      `${apiUrl}/api/v1/orders/${multiLabelOrderId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    const order = data.order;

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

    expect(typeof dairyItem.product_label).toBe('number');
    expect(typeof meatItem.product_label).toBe('number');
    expect(typeof hamburgerItem.product_label).toBe('number');
  });

  it('should validate that product_label is correctly stored and retrieved', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/${createdOrderWithLabelId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    const order = data.order;
    const item = order.items[0];

    expect(typeof item.product_label).toBe('number');
    expect(Number.isInteger(item.product_label)).toBe(true);
    expect(item.product_label).toBe(ProductLabel.HAMBURGERS);
    expect(item.product_label).toBe(2);

    expect(Object.values(ProductLabel)).toContain(item.product_label);
  });

  it('should preserve product label snapshot behavior', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/${createdOrderWithLabelId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    const order = data.order;
    const item = order.items[0];

    expect(item.product_label).toBe(ProductLabel.HAMBURGERS);
    expect(item.product_name).toBe('Test Product With Label Get Order By ID');

    expect(typeof item.product_label).toBe('number');
    expect(Object.values(ProductLabel)).toContain(item.product_label);
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
    expect(item.product_label).toBe(ProductLabel.DAIRY);
  });

  it('should handle decimal quantities in items correctly', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/${createdOrderWithProfitId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    const order = data.order;
    const item = order.items[0];

    expect(item.quantity).toBe(1.5);
    expect(item.subtotal).toBe(150.0);
    expect(item.total_profit).toBe(60.0);
    expect(item.product_label).toBe(ProductLabel.MEATS);

    expect(Number.isFinite(item.quantity)).toBe(true);
    expect(Number.isFinite(item.subtotal)).toBe(true);
    expect(Number.isFinite(item.total_profit)).toBe(true);
  });

  it('should validate all ProductLabel enum values in order items', async () => {
    const allLabelProducts = [
      {
        name: 'Test PROCESSED Product Order ID',
        label: ProductLabel.PROCESSED,
        img: 'processed-order-id.jpg',
        description: 'Processed product for order test',
        maker: 'Processed Maker',
        metric: ProductMetric.KG,
        stock: 10.0,
        price: 55.0,
        purchase_price: 35.0,
      },
    ];

    const createdLabelProducts = [];
    for (const productData of allLabelProducts) {
      const productResponse = await fetch(`${apiUrl}/api/v1/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      const productResult = await productResponse.json();
      createdLabelProducts.push({
        ...productData,
        id: productResult.id,
      });
    }

    const allLabelsOrderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        { product_id: testProductId, quantity: 1 },
        { product_id: testProductWithProfitId, quantity: 1 },
        { product_id: testProductWithLabelId, quantity: 1 },
        { product_id: createdLabelProducts[0].id, quantity: 1 },
      ],
      notes: 'All labels validation',
    };

    const createResponse = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(allLabelsOrderData),
    });

    const createData = await createResponse.json();
    const allLabelsOrderId = createData.id;

    const response = await fetch(`${apiUrl}/api/v1/orders/${allLabelsOrderId}`);

    expect(response.status).toBe(200);

    const data = await response.json();
    const order = data.order;

    expect(order.items.length).toBe(4);

    const dairyItem = order.items.find(
      (item) => item.product_name === 'Test Product Get Order By ID'
    );
    const meatItem = order.items.find(
      (item) => item.product_name === 'Test Product With Profit Get Order By ID'
    );
    const hamburgerItem = order.items.find(
      (item) => item.product_name === 'Test Product With Label Get Order By ID'
    );
    const processedItem = order.items.find(
      (item) => item.product_name === 'Test PROCESSED Product Order ID'
    );

    expect(dairyItem.product_label).toBe(0);
    expect(meatItem.product_label).toBe(1);
    expect(hamburgerItem.product_label).toBe(2);
    expect(processedItem.product_label).toBe(3);

    [dairyItem, meatItem, hamburgerItem, processedItem].forEach((item) => {
      expect(typeof item.product_label).toBe('number');
      expect(Number.isInteger(item.product_label)).toBe(true);
      expect(item.product_label).toBeGreaterThanOrEqual(0);
      expect(item.product_label).toBeLessThanOrEqual(3);
      expect(Object.values(ProductLabel)).toContain(item.product_label);
    });
  });

  it('should validate profit calculations consistency', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/${createdOrderWithProfitId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    const order = data.order;

    expect(order.total_purchase_cost).toBeGreaterThanOrEqual(0);
    expect(order.total_profit).toBeGreaterThanOrEqual(0);
    expect(order.profit_margin_percentage).toBeGreaterThanOrEqual(0);
    expect(order.profit_margin_percentage).toBeLessThanOrEqual(100);

    if (order.subtotal > 0) {
      const expectedPercentage = (order.total_profit / order.subtotal) * 100;
      expect(order.profit_margin_percentage).toBeCloseTo(expectedPercentage, 1);
    }

    expect(Number.isFinite(order.total_purchase_cost)).toBe(true);
    expect(Number.isFinite(order.total_profit)).toBe(true);
    expect(Number.isFinite(order.profit_margin_percentage)).toBe(true);
  });

  it('should return consistent data types for all numeric fields including labels', async () => {
    const response = await fetch(`${apiUrl}/api/v1/orders/${createdOrderId}`);

    expect(response.status).toBe(200);

    const data = await response.json();
    const order = data.order;

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

    order.items.forEach((item) => {
      expect(typeof item.unit_purchase_price).toBe('number');
      expect(typeof item.unit_profit).toBe('number');
      expect(typeof item.total_profit).toBe('number');
      expect(isNaN(item.unit_purchase_price)).toBe(false);
      expect(isNaN(item.unit_profit)).toBe(false);
      expect(isNaN(item.total_profit)).toBe(false);

      if (item.product_label !== undefined) {
        expect(typeof item.product_label).toBe('number');
        expect(isNaN(item.product_label)).toBe(false);
        expect(Number.isInteger(item.product_label)).toBe(true);
      }
    });
  });

  it('should handle server errors gracefully', async () => {
    const response = await fetch(`${apiUrl}/api/v1/orders/${createdOrderId}`);

    expect([200, 500]).toContain(response.status);

    if (response.status === 500) {
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Failed to fetch order');
    }
  });

  it('should return order with items sorted by created_at DESC', async () => {
    const multiItemOrderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        { product_id: testProductId, quantity: 1 },
        { product_id: testProductWithProfitId, quantity: 1 },
      ],
    };

    const createResponse = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(multiItemOrderData),
    });

    const createData = await createResponse.json();
    const multiItemOrderId = createData.id;

    const response = await fetch(`${apiUrl}/api/v1/orders/${multiItemOrderId}`);

    expect(response.status).toBe(200);

    const data = await response.json();
    const order = data.order;

    expect(order.items.length).toBe(2);

    for (let i = 0; i < order.items.length - 1; i++) {
      const currentItemDate = new Date(order.items[i].created_at);
      const nextItemDate = new Date(order.items[i + 1].created_at);
      expect(currentItemDate.getTime()).toBeGreaterThanOrEqual(
        nextItemDate.getTime()
      );
    }

    order.items.forEach((item) => {
      expect(typeof item.product_label).toBe('number');
      expect(Object.values(ProductLabel)).toContain(item.product_label);
    });
  });

  it('should validate database format consistency for product_label field', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/${createdOrderWithLabelId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    const order = data.order;
    const item = order.items[0];

    expect(typeof item.product_label).toBe('number');
    expect(Number.isInteger(item.product_label)).toBe(true);
    expect(item.product_label).toBeGreaterThanOrEqual(0);
    expect(item.product_label).toBeLessThanOrEqual(3);

    expect(item.product_label).toBe(ProductLabel.HAMBURGERS);
    expect(item.product_label).toBe(2);

    expect([0, 1, 2, 3]).toContain(item.product_label);
    expect(Object.values(ProductLabel)).toContain(item.product_label);
  });
});

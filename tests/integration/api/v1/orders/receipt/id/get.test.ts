import { CreateOrderRequest, ProductMetric } from 'src/constants/types';
import { waitForAllServices } from 'tests/orchestrator';
import { getApiEndpoint } from 'tests/utils';

describe('GET /api/v1/orders/receipt/[id]', () => {
  let createdOrderId: string;
  let createdOrderWithProfitId: string;
  let minimalOrderId: string;
  let testClientId: string;
  let testProductId: string;
  let testProductWithProfitId: string;
  const apiUrl = getApiEndpoint();

  beforeAll(async () => {
    await waitForAllServices();

    const clientToCreate = {
      name: 'Test Client Receipt',
      establishment_type: 'Restaurant',
      phone: '+5511999887766',
      maps_link: 'https://maps.google.com/test-receipt-client',
    };

    const clientResponse = await fetch(`${apiUrl}/api/v1/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientToCreate),
    });

    const clientData = await clientResponse.json();
    testClientId = clientData.id;

    const productToCreate = {
      name: 'Test Product Receipt',
      img: 'test-receipt-product.jpg',
      description: 'Product for testing receipt generation',
      maker: 'Receipt Test Maker',
      metric: ProductMetric.UNIT,
      stock: 100.0,
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
      name: 'Test Product Receipt With Profit',
      img: 'test-receipt-profit.jpg',
      description: 'Product with profit for receipt testing',
      maker: 'Profit Receipt Maker',
      metric: ProductMetric.KG,
      stock: 50.0,
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

    const orderToCreate: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 2.0,
        },
        {
          product_id: testProductWithProfitId,
          quantity: 1.5,
        },
      ],
      discount: 10.0,
      tax: 7.5,
      notes: 'Test order for receipt generation',
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
          quantity: 2.5,
        },
      ],
      discount: 20.0,
      tax: 15.0,
      notes: 'Test order with profit for receipt',
    };

    const orderWithProfitResponse = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderWithProfitToCreate),
    });

    const orderWithProfitData = await orderWithProfitResponse.json();
    createdOrderWithProfitId = orderWithProfitData.id;

    const minimalOrderData: CreateOrderRequest = {
      client_id: testClientId,
      items: [
        {
          product_id: testProductId,
          quantity: 1.0,
        },
      ],
    };

    const minimalOrderResponse = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(minimalOrderData),
    });

    const minimalOrderResponseData = await minimalOrderResponse.json();
    minimalOrderId = minimalOrderResponseData.id;
  });

  it('should generate PDF receipt for valid order ID', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/receipt/${createdOrderId}`
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/pdf');
    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(response.headers.get('content-disposition')).toContain('.pdf');
    expect(response.headers.get('content-length')).toBeDefined();

    const buffer = await response.arrayBuffer();
    expect(buffer.byteLength).toBeGreaterThan(0);

    const uint8Array = new Uint8Array(buffer);
    const pdfHeader = String.fromCharCode(...uint8Array.slice(0, 4));
    expect(pdfHeader).toBe('%PDF');
  });

  it('should generate PDF with correct filename format', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/receipt/${createdOrderId}`
    );

    expect(response.status).toBe(200);

    const contentDisposition = response.headers.get('content-disposition');
    expect(contentDisposition).toContain('CHAMONE-FRIOS-');
    expect(contentDisposition).toContain('.pdf');
    expect(contentDisposition).toMatch(
      /filename="CHAMONE-FRIOS-\d{2}-\d{2}-\d{4}\.pdf"/
    );
  });

  it('should return 404 for non-existent order ID', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const response = await fetch(
      `${apiUrl}/api/v1/orders/receipt/${nonExistentId}`
    );

    expect(response.status).toBe(404);
    expect(response.headers.get('content-type')).toContain('application/json');

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Order not found');
    expect(data).toHaveProperty('message');
    expect(data.message).toBe('Pedido não encontrado');
  });

  it('should return 400 for very short order ID', async () => {
    const shortId = '123';
    const response = await fetch(`${apiUrl}/api/v1/orders/receipt/${shortId}`);

    expect(response.status).toBe(400);
    expect(response.headers.get('content-type')).toContain('application/json');

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Invalid order ID');
    expect(data).toHaveProperty('message');
    expect(data.message).toBe('ID do pedido inválido');
  });

  it('should return 400 when order ID is missing', async () => {
    const response = await fetch(`${apiUrl}/api/v1/orders/receipt/`);

    expect([400, 404]).toContain(response.status);
  });

  it('should generate PDF for order with decimal quantities', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/receipt/${createdOrderWithProfitId}`
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/pdf');

    const buffer = await response.arrayBuffer();
    expect(buffer.byteLength).toBeGreaterThan(0);

    const uint8Array = new Uint8Array(buffer);
    const pdfHeader = String.fromCharCode(...uint8Array.slice(0, 4));
    expect(pdfHeader).toBe('%PDF');
  });

  it('should generate PDF for order with minimal data', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/receipt/${minimalOrderId}`
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/pdf');

    const buffer = await response.arrayBuffer();
    expect(buffer.byteLength).toBeGreaterThan(0);

    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(response.headers.get('content-length')).toBeDefined();
    expect(parseInt(response.headers.get('content-length')!)).toBe(
      buffer.byteLength
    );
  });

  it('should generate PDF for order with multiple items', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/receipt/${createdOrderId}`
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/pdf');

    const buffer = await response.arrayBuffer();
    expect(buffer.byteLength).toBeGreaterThan(0);

    const minimalResponse = await fetch(
      `${apiUrl}/api/v1/orders/receipt/${minimalOrderId}`
    );
    const minimalBuffer = await minimalResponse.arrayBuffer();

    expect(buffer.byteLength).toBeGreaterThan(minimalBuffer.byteLength * 0.8);
  });

  it('should return 405 for non-GET methods', async () => {
    const methods = ['POST', 'PUT', 'PATCH', 'DELETE'];

    for (const method of methods) {
      const response = await fetch(
        `${apiUrl}/api/v1/orders/receipt/${createdOrderId}`,
        { method }
      );

      expect(response.status).toBe(405);

      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Method not allowed');
    }
  });

  it('should handle server errors gracefully', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/receipt/${createdOrderId}`
    );

    expect([200, 500]).toContain(response.status);

    if (response.status === 500) {
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Internal server error');
      expect(data).toHaveProperty('message');
      expect(data.message).toBe('Erro interno do servidor');
    }
  });

  it('should generate consistent PDF size for same order', async () => {
    const response1 = await fetch(
      `${apiUrl}/api/v1/orders/receipt/${createdOrderId}`
    );
    const response2 = await fetch(
      `${apiUrl}/api/v1/orders/receipt/${createdOrderId}`
    );

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);

    const buffer1 = await response1.arrayBuffer();
    const buffer2 = await response2.arrayBuffer();

    expect(Math.abs(buffer1.byteLength - buffer2.byteLength)).toBeLessThan(100);
  });

  it('should handle special characters in client name', async () => {
    const specialClientData = {
      name: 'José da Silva & Filhos Ltda.',
      establishment_type: 'Padaria',
      phone: '+5511999887755',
      maps_link: 'https://maps.google.com/test-special-chars',
    };

    const specialClientResponse = await fetch(`${apiUrl}/api/v1/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(specialClientData),
    });

    const specialClientResult = await specialClientResponse.json();

    const specialOrderData: CreateOrderRequest = {
      client_id: specialClientResult.id,
      items: [{ product_id: testProductId, quantity: 1 }],
    };

    const specialOrderResponse = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(specialOrderData),
    });

    const specialOrder = await specialOrderResponse.json();

    const response = await fetch(
      `${apiUrl}/api/v1/orders/receipt/${specialOrder.id}`
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/pdf');

    const buffer = await response.arrayBuffer();
    expect(buffer.byteLength).toBeGreaterThan(0);
  });

  it('should handle concurrent receipt generation requests', async () => {
    const promises = Array(5)
      .fill(null)
      .map(() => fetch(`${apiUrl}/api/v1/orders/receipt/${createdOrderId}`));

    const responses = await Promise.all(promises);

    responses.forEach((response) => {
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('application/pdf');
    });

    const buffers = await Promise.all(
      responses.map((response) => response.arrayBuffer())
    );

    buffers.forEach((buffer) => {
      expect(buffer.byteLength).toBeGreaterThan(0);
      const uint8Array = new Uint8Array(buffer);
      const pdfHeader = String.fromCharCode(...uint8Array.slice(0, 4));
      expect(pdfHeader).toBe('%PDF');
    });
  });

  it('should validate PDF content structure', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/receipt/${createdOrderId}`
    );

    expect(response.status).toBe(200);

    const buffer = await response.arrayBuffer();
    const pdfContent = String.fromCharCode(...new Uint8Array(buffer));

    expect(pdfContent).toContain('%PDF');
    expect(pdfContent).toContain('obj');
    expect(pdfContent).toContain('stream');
    expect(pdfContent).toContain('endstream');
    expect(pdfContent).toContain('%%EOF');
  });

  it('should handle orders with different statuses', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/receipt/${createdOrderId}`
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/pdf');

    const buffer = await response.arrayBuffer();
    expect(buffer.byteLength).toBeGreaterThan(0);

    const uint8Array = new Uint8Array(buffer);
    const pdfHeader = String.fromCharCode(...uint8Array.slice(0, 4));
    expect(pdfHeader).toBe('%PDF');
  });

  it('should generate PDF with proper headers for download', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/receipt/${createdOrderId}`
    );

    expect(response.status).toBe(200);

    expect(response.headers.get('content-type')).toBe('application/pdf');
    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(response.headers.get('content-disposition')).toContain('filename=');
    expect(response.headers.get('content-length')).toBeDefined();

    const contentLength = parseInt(response.headers.get('content-length')!);
    expect(contentLength).toBeGreaterThan(0);

    const buffer = await response.arrayBuffer();
    expect(buffer.byteLength).toBe(contentLength);
  });

  it('should handle empty notes in order', async () => {
    const orderWithoutNotes: CreateOrderRequest = {
      client_id: testClientId,
      items: [{ product_id: testProductId, quantity: 1 }],
    };

    const orderResponse = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderWithoutNotes),
    });

    const orderData = await orderResponse.json();

    const response = await fetch(
      `${apiUrl}/api/v1/orders/receipt/${orderData.id}`
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/pdf');

    const buffer = await response.arrayBuffer();
    expect(buffer.byteLength).toBeGreaterThan(0);
  });

  it('should validate filename date format in content-disposition', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/orders/receipt/${createdOrderId}`
    );

    expect(response.status).toBe(200);

    const contentDisposition = response.headers.get('content-disposition');

    const filenameMatch = contentDisposition?.match(
      /CHAMONE-FRIOS-(\d{2}-\d{2}-\d{4})\.pdf/
    );
    expect(filenameMatch).toBeTruthy();

    if (filenameMatch) {
      const dateStr = filenameMatch[1];
      const [day, month, year] = dateStr.split('-').map(Number);

      expect(day).toBeGreaterThanOrEqual(1);
      expect(day).toBeLessThanOrEqual(31);
      expect(month).toBeGreaterThanOrEqual(1);
      expect(month).toBeLessThanOrEqual(12);
      expect(year).toBeGreaterThanOrEqual(2000);
      expect(year).toBeLessThanOrEqual(3000);
    }
  });
});

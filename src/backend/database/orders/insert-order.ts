import { CreateOrderRequest, OrderStatus, Product } from 'src/constants/types';
import { query } from 'src/integrations/database';
import { v4 as uuidv4 } from 'uuid';

type InsertOrderInput = CreateOrderRequest;

const insertOrder = async (orderData: InsertOrderInput): Promise<string> => {
  const orderId = uuidv4();
  const { client_id, items, discount = 0, tax = 0, notes } = orderData;

  await query('BEGIN');
  try {
    const clientQuery = `
      SELECT id, name, establishment_type, phone
      FROM clients
      WHERE id = $1
    `;
    const clientResult = await query({
      text: clientQuery,
      values: [client_id],
    });

    if (!clientResult.rows || clientResult.rows.length === 0) {
      throw new Error(`Client [${client_id}] not found`);
    }

    const clientInfo = clientResult.rows[0];

    let subtotal = 0;
    const orderItems: Array<{
      productInfo: Product;
      quantity: number;
      itemSubtotal: number;
    }> = [];

    for (const item of items) {
      const productQuery = `
        SELECT id, name, description, maker, metric, img, price, stock
        FROM products
        WHERE id = $1
      `;
      const productResult = await query({
        text: productQuery,
        values: [item.product_id],
      });

      if (!productResult.rows || productResult.rows.length === 0) {
        throw new Error(`Product [${item.product_id}] not found`);
      }

      const productInfo = productResult.rows[0];

      if (productInfo.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for product [${productInfo.name}]. Available: ${productInfo.stock}, Requested: ${item.quantity}`
        );
      }

      const itemSubtotal = parseFloat(productInfo.price) * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productInfo,
        quantity: item.quantity,
        itemSubtotal,
      });
    }

    const total = subtotal - (discount || 0) + (tax || 0);

    const orderSql = `
      INSERT INTO orders (
        id,
        client_id,
        client_name,
        client_establishment_type,
        client_phone,
        status,
        subtotal,
        discount,
        tax,
        total,
        notes,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *;
    `;

    const orderValues = [
      orderId,
      client_id,
      clientInfo.name,
      clientInfo.establishment_type,
      clientInfo.phone,
      OrderStatus.PENDING,
      subtotal,
      discount,
      tax,
      total,
      notes,
    ];

    await query({ text: orderSql, values: orderValues });

    for (const { productInfo, quantity, itemSubtotal } of orderItems) {
      const itemId = uuidv4();

      const itemSql = `
        INSERT INTO order_items (
          id,
          order_id,
          product_id,
          product_name,
          product_description,
          product_maker,
          product_metric,
          product_img,
          unit_price,
          quantity,
          subtotal,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        RETURNING *;
      `;

      const itemValues = [
        itemId,
        orderId,
        productInfo.id,
        productInfo.name,
        productInfo.description,
        productInfo.maker,
        productInfo.metric,
        productInfo.img,
        productInfo.price,
        quantity,
        itemSubtotal,
      ];

      await query({ text: itemSql, values: itemValues });

      const updateStockSql = `
        UPDATE products
        SET stock = stock - $1
        WHERE id = $2
      `;
      await query({ text: updateStockSql, values: [quantity, productInfo.id] });
    }

    await query('COMMIT');

    return orderId;
  } catch (error) {
    await query('ROLLBACK');
    console.error('[Source orders.ts@insertOrder()]', error);
    throw error;
  }
};

export { insertOrder };

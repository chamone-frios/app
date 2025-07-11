import {
  Order,
  OrderItem,
  OrderWithItems,
  ProductMetric,
} from 'src/constants/types';
import { query } from 'src/integrations/database';

const getOrder = async ({ id }: { id: string }): Promise<OrderWithItems> => {
  const orderQueryString = `
    SELECT id, client_id, client_name, client_establishment_type, client_phone,
           status, subtotal, discount, tax, total, notes, created_at
    FROM orders
    WHERE id = $1
  `;

  try {
    const orderResult = await query({ text: orderQueryString, values: [id] });

    if (!orderResult.rows || orderResult.rows.length === 0)
      throw new Error(`Order [${id}] not found`);

    const orderRow = orderResult.rows[0];

    const itemsQueryString = `
      SELECT id, order_id, product_id, product_name, product_description,
             product_maker, product_metric, product_img, unit_price, quantity,
             subtotal, created_at
      FROM order_items
      WHERE order_id = $1
      ORDER BY created_at DESC
    `;

    const itemsResult = await query({ text: itemsQueryString, values: [id] });

    const items: OrderItem[] = itemsResult.rows.map((row) => ({
      id: row.id,
      order_id: row.order_id,
      product_id: row.product_id,
      product_name: row.product_name,
      product_description: row.product_description,
      product_maker: row.product_maker,
      product_metric:
        ProductMetric[
          row.product_metric.toUpperCase() as keyof typeof ProductMetric
        ],
      product_img: row.product_img,
      unit_price: parseFloat(row.unit_price),
      quantity: parseFloat(row.quantity),
      subtotal: parseFloat(row.subtotal),
      created_at: row.created_at,
    }));

    const order: OrderWithItems = {
      id: orderRow.id,
      client_id: orderRow.client_id,
      client_name: orderRow.client_name,
      client_establishment_type: orderRow.client_establishment_type,
      client_phone: orderRow.client_phone,
      status: orderRow.status,
      subtotal: parseFloat(orderRow.subtotal),
      discount: parseFloat(orderRow.discount) ?? 0,
      tax: parseFloat(orderRow.tax) ?? 0,
      total: parseFloat(orderRow.total),
      notes: orderRow.notes,
      created_at: orderRow.created_at,
      items,
    };

    return order;
  } catch (error) {
    console.error(
      `[Source get-orders.ts@getOrder()] Error fetching order ${id}:`,
      error
    );
    throw error;
  }
};

const getOrders = async (): Promise<Order[]> => {
  const queryString = `
    SELECT id, client_id, client_name, client_establishment_type, client_phone,
           status, subtotal, discount, tax, total, notes, created_at
    FROM orders
    ORDER BY created_at DESC
  `;

  try {
    const { rows } = await query(queryString);
    return rows.map((row) => ({
      id: row.id,
      client_id: row.client_id,
      client_name: row.client_name,
      client_establishment_type: row.client_establishment_type,
      client_phone: row.client_phone,
      status: row.status,
      subtotal: parseFloat(row.subtotal),
      discount: parseFloat(row.discount) ?? 0,
      tax: parseFloat(row.tax) ?? 0,
      total: parseFloat(row.total),
      notes: row.notes,
      created_at: row.created_at,
    }));
  } catch (error) {
    console.error(
      '[Source get-orders.ts@getOrders()] Error fetching orders:',
      error
    );
    throw error;
  }
};

const getOrdersByClientId = async ({
  client_id,
}: {
  client_id: string;
}): Promise<Order[]> => {
  const queryString = `
    SELECT id, client_id, client_name, client_establishment_type, client_phone,
           status, subtotal, discount, tax, total, notes, created_at
    FROM orders
    WHERE client_id = $1
    ORDER BY created_at DESC
  `;

  try {
    const { rows } = await query({ text: queryString, values: [client_id] });
    return rows.map((row) => ({
      id: row.id,
      client_id: row.client_id,
      client_name: row.client_name,
      client_establishment_type: row.client_establishment_type,
      client_phone: row.client_phone,
      status: row.status,
      subtotal: parseFloat(row.subtotal),
      discount: parseFloat(row.discount) ?? 0,
      tax: parseFloat(row.tax) ?? 0,
      total: parseFloat(row.total),
      notes: row.notes,
      created_at: row.created_at,
    }));
  } catch (error) {
    console.error(
      `[Source get-orders.ts@getOrdersByClientId()] Error fetching orders for client ${client_id}:`,
      error
    );
    throw error;
  }
};

export { getOrder, getOrders, getOrdersByClientId };

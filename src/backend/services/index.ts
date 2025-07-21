import { createClient } from './clients/create-client';
import { deleteClientById } from './clients/delete-client';
import { getClientById } from './clients/get-client';
import { listClients } from './clients/list-clients';
import { updateClientById } from './clients/update-client';
import { createOrder } from './orders/create-order';
import { deleteOrderById } from './orders/delete-order';
import { getClientOrders } from './orders/get-client-orders';
import { getOrderById } from './orders/get-order';
import { listOrders } from './orders/list-orders';
import { updateOrderStatus } from './orders/update-order-status';
import { createProduct } from './products/create-product';
import { deleteProductById } from './products/delete-product';
import { getProductById } from './products/get-product';
import { listProducts } from './products/list-products';
import { updateProductById } from './products/update-product';

export {
  // products
  listProducts,
  createProduct,
  getProductById,
  deleteProductById,
  updateProductById,

  // clients
  listClients,
  createClient,
  getClientById,
  deleteClientById,
  updateClientById,

  // orders
  deleteOrderById,
  listOrders,
  createOrder,
  getOrderById,
  getClientOrders,
  updateOrderStatus,
};

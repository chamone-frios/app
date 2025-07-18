import { deleteClient } from './clients/delete-client';
import { getClient, getClients } from './clients/get-clients';
import { insertClient } from './clients/insert-client';
import { updateClient } from './clients/update-client';
import { getOrders, getOrder, getOrdersByClientId } from './orders/get-orders';
import { insertOrder } from './orders/insert-order';
import { updateOrderStatus } from './orders/update-order';
import { deleteProduct } from './products/delete-product';
import { getProduct, getProducts } from './products/get-products';
import { insertProduct } from './products/insert-product';
import { updateProduct } from './products/update-product';

export {
  // products
  insertProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,

  // clients
  insertClient,
  getClient,
  getClients,
  updateClient,
  deleteClient,

  // order
  insertOrder,
  getOrder,
  getOrders,
  getOrdersByClientId,
  updateOrderStatus,
};

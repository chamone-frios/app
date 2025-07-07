import { createClient } from './clients/create-client';
import { deleteClientById } from './clients/delete-client';
import { getClientById } from './clients/get-client';
import { listClients } from './clients/list-clients';
import { updateClientById } from './clients/update-client';
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
};

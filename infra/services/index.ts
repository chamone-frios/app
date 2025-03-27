import { createProduct } from 'infra/services/products/create-product';
import { deleteProductById } from 'infra/services/products/delete-product';
import { getProductById } from 'infra/services/products/get-product';
import { listProducts } from 'infra/services/products/list-products';
import { updateProductById } from 'infra/services/products/update-product';

export {
  listProducts,
  createProduct,
  getProductById,
  deleteProductById,
  updateProductById,
};

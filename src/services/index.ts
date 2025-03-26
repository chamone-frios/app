import { createProduct } from 'src/services/products/create-product';
import { deleteProductById } from 'src/services/products/delete-product';
import { getProductById } from 'src/services/products/get-product';
import { listProducts } from 'src/services/products/list-products';
import { updateProductById } from 'src/services/products/update-product';

export {
  listProducts,
  createProduct,
  getProductById,
  deleteProductById,
  updateProductById,
};

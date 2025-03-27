import { useQuery } from '@tanstack/react-query';

import axios from 'axios';
import {
  GetProductResponse,
  GetProductsResponse,
  Product,
} from 'infra/constants/types';

const postProduct = (product: Omit<Product, 'id'>) =>
  axios.post<Omit<Product, 'id'>, string>('/api/v1/products', product);

const updateProduct = (id: string, product: Omit<Product, 'id'>) =>
  axios.patch<Omit<Product, 'id'>, string>(`/api/v1/products/${id}`, product);

const getProductById = (id: string) =>
  axios.get<null, { data: GetProductResponse }>(`/api/v1/products/${id}`);

const deleteProductById = (id: string) =>
  axios.delete<null, null>(`/api/v1/products/${id}`);

const getProducts = () =>
  axios.get<null, { data: GetProductsResponse }>('/api/v1/products');

const useGetProductById = (id: string) => {
  const { data, ...options } = useQuery({
    queryKey: ['get-product', id],
    queryFn: () => getProductById(id),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const product = data?.data.product;

  return { product, ...options };
};

const useGetProducts = () => {
  const { data, ...options } = useQuery({
    queryKey: ['get-products'],
    queryFn: getProducts,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const products = data?.data.products || [];

  return { products, ...options };
};

export {
  postProduct,
  updateProduct,
  useGetProducts,
  useGetProductById,
  deleteProductById,
};

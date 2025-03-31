import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import {
  Stack,
  Button,
  Divider,
  Typography,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { getProducts } from 'src/backend/database';
import { Product } from 'src/constants/types';
import { DeleteModal, ProductCard } from 'src/frontend/components';

type ProductListProps = {
  products: Product[];
};

const ProductList = ({ products }: ProductListProps) => {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isRouteChanging, setIsRouteChanging] = useState(false);

  useEffect(() => {
    const handleStart = (url: string) => {
      if (url === router.asPath && !isFetching) {
        setIsRouteChanging(true);
      }
    };

    const handleComplete = () => {
      setIsRouteChanging(false);
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router, isFetching]);

  const handleEditClick = (productId: string) => {
    router.push(`/products/edit/${productId}`);
  };

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      setIsFetching(true);
      try {
        await axios.delete(`/api/v1/products/${productToDelete}`);
        router.replace(router.asPath);
        handleCloseModal();
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        setIsFetching(false);
      }
    }
  };

  const isLoading = isFetching || isRouteChanging;

  return (
    <Stack spacing={8}>
      <Stack spacing={4}>
        <Typography variant="hero-sm">Produtos</Typography>
        <Typography>Esses são nossos produtos! 🧀</Typography>
        {products.length > 0 && (
          <Stack direction="row" width="100%">
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/products/add')}
            >
              Adicionar
            </Button>
          </Stack>
        )}
      </Stack>
      <Divider />
      <Stack height="100%" gap={4}>
        {isLoading ? (
          <Stack alignItems="center" justifyContent="center" height="300px">
            <CircularProgress />
          </Stack>
        ) : !products || products.length === 0 ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={4}
            height="300px"
          >
            <Typography>Nenhum produto cadastrado 😭</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/products/add')}
            >
              Novo produto
            </Button>
          </Stack>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))
        )}
      </Stack>
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
      >
        <Typography>Tem certeza que deseja excluir este produto?</Typography>
        <Typography gutterBottom>Esta ação não pode ser desfeita.</Typography>
      </DeleteModal>
    </Stack>
  );
};

export const getServerSideProps: GetServerSideProps<
  ProductListProps
> = async () => {
  try {
    const products = await getProducts();
    return { props: { products } };
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return { props: { products: [] } };
  }
};

export default ProductList;

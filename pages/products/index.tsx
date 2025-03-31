import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';

import {
  Stack,
  Button,
  Divider,
  Typography,
  CircularProgress,
} from '@mui/material';
import { getProducts } from 'src/backend/database';
import { Product } from 'src/constants/types';
import { http } from 'src/frontend/api/http';
import { DeleteModal, ProductCard } from 'src/frontend/components';
import { useIsNextLoading } from 'src/frontend/hooks';

type ProductListProps = {
  products: Product[];
};

const ProductList = ({ products: initialProducts }: ProductListProps) => {
  const router = useRouter();
  const isNextLoading = useIsNextLoading();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    if (!productToDelete) return;

    setIsDeleting(true);
    handleCloseModal();
    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== productToDelete)
    );

    try {
      await http.delete(`/api/v1/products/${productToDelete}`);
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      setProducts(initialProducts);
    } finally {
      setIsDeleting(false);
    }
  };

  const isLoading = isDeleting || isNextLoading;

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

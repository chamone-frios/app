import {
  Stack,
  Button,
  Divider,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { deleteProductById, useGetProducts } from 'infra/api/products/http';
import { DeleteModal, ProductCard } from 'infra/components';
import { useRouter } from 'next/router';
import { useState } from 'react';

const ProductList = () => {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const { products, isFetching, refetch } = useGetProducts();
  const { mutate } = useMutation({
    mutationFn: (id: string) => deleteProductById(id),
    onSuccess: () => {
      refetch();
      handleCloseModal();
    },
  });

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

  const handleConfirmDelete = () => {
    if (productToDelete) mutate(productToDelete);
  };

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
        {isFetching ? (
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

export default ProductList;

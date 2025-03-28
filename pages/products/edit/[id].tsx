import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';

import { Alert, CircularProgress, Stack, Typography } from '@mui/material';
import { Product } from 'src/constants/types';
import {
  updateProduct,
  useGetProductById,
} from 'src/frontend/api/products/http';
import { ProductForm } from 'src/frontend/components';

const EditProduct = () => {
  const router = useRouter();
  const { id } = router.query;
  const { product, isFetching } = useGetProductById(id as string);

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: (product: Product) => updateProduct(id as string, product),
  });

  return (
    <Stack spacing={4}>
      <Typography variant="hero-sm">Editar produto</Typography>
      <Alert severity={isSuccess ? 'success' : isError ? 'error' : 'info'}>
        {isSuccess
          ? 'Produto editado!'
          : isError
            ? 'Erro ao editar produto.'
            : 'Preencha corretamente antes de editar o produto.'}
      </Alert>
      {isFetching ? (
        <Stack alignItems="center" justifyContent="center" height="300px">
          <CircularProgress />
        </Stack>
      ) : (
        <ProductForm
          isLoading={isPending || !id}
          initialState={{
            name: product.name,
            description: product.description,
            maker: product.maker,
            metric: product.metric,
            stock: product.stock,
            price: product.price,
          }}
          submitButtonText="Confirmar edição"
          onSubmit={mutate}
        />
      )}
    </Stack>
  );
};

export default EditProduct;

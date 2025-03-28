import { useMutation } from '@tanstack/react-query';

import { Alert, Stack, Typography } from '@mui/material';
import { Product, ProductMetric } from 'src/constants/types';
import { postProduct } from 'src/frontend/api/products/http';
import { ProductForm } from 'src/frontend/components';

const AddProduct = () => {
  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: postProduct,
  });

  const initialState: Omit<Product, 'id' | 'img'> = {
    name: '',
    description: '',
    maker: '',
    metric: ProductMetric.UNIT,
    price: 0.0,
    stock: 0,
  };

  return (
    <Stack spacing={4}>
      <Typography variant="hero-sm">Adicionar produto</Typography>
      <Alert severity={isSuccess ? 'success' : isError ? 'error' : 'info'}>
        {isSuccess
          ? 'Produto adicionado!'
          : isError
            ? 'Erro ao adicionar produto.'
            : 'Preencha corretamente antes de adicionar o produto.'}
      </Alert>
      <ProductForm
        isLoading={isPending}
        initialState={initialState}
        submitButtonText="Adicionar produto"
        onSubmit={mutate}
      />
    </Stack>
  );
};

export default AddProduct;

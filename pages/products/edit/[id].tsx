import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { Alert, CircularProgress, Stack, Typography } from '@mui/material';
import axios from 'axios';
import { getProduct } from 'src/backend/database';
import { Product } from 'src/constants/types';
import { ProductForm } from 'src/frontend/components';
import { useIsNextLoading } from 'src/frontend/hooks';

type EditProductProps = {
  product: Product | null;
  error?: string;
};

const EditProduct = ({ product, error: serverError }: EditProductProps) => {
  const router = useRouter();
  const isNextLoading = useIsNextLoading();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState(serverError || '');

  const handleSubmit = async (updatedProduct: Product) => {
    if (!product?.id) return;

    setIsSubmitting(true);
    try {
      await axios.patch(`/api/v1/products/${product.id}`, updatedProduct);
      setStatus('success');
    } catch (err) {
      console.error('Erro ao atualizar produto:', err);
      setStatus('error');
      setError(err.response?.data?.message || 'Erro ao atualizar produto.');
      setIsSubmitting(false);
    }
  };

  if (serverError || !product) {
    return (
      <Stack spacing={4}>
        <Typography variant="hero-sm">Editar produto</Typography>
        <Alert severity="error">
          {serverError || 'Produto não encontrado'}
        </Alert>
        <Stack direction="row" justifyContent="flex-start">
          <button
            onClick={() => router.push('/products')}
            style={{ padding: '8px 16px' }}
          >
            Voltar para a lista
          </button>
        </Stack>
      </Stack>
    );
  }

  const getAlertSeverity = () => {
    if (status === 'success') return 'success';
    if (status === 'error') return 'error';
    return 'info';
  };

  const getAlertMessage = () => {
    if (status === 'success')
      return 'Produto editado com sucesso! Redirecionando...';
    if (status === 'error') return error || 'Erro ao editar produto.';
    return 'Preencha corretamente antes de editar o produto.';
  };

  return (
    <Stack spacing={4}>
      <Typography variant="hero-sm">Editar produto</Typography>
      <Alert severity={getAlertSeverity()}>{getAlertMessage()}</Alert>
      {isNextLoading ? (
        <Stack alignItems="center" justifyContent="center" height="300px">
          <CircularProgress />
        </Stack>
      ) : (
        <ProductForm
          isLoading={isSubmitting}
          initialState={{
            name: product.name,
            description: product.description,
            maker: product.maker,
            metric: product.metric,
            stock: product.stock,
            price: product.price,
          }}
          submitButtonText="Confirmar edição"
          onSubmit={handleSubmit}
        />
      )}
    </Stack>
  );
};

export const getServerSideProps: GetServerSideProps<EditProductProps> = async (
  context
) => {
  const { id } = context.params || {};

  if (!id || Array.isArray(id)) {
    return {
      props: {
        product: null,
        error: 'ID de produto inválido',
      },
    };
  }

  try {
    const product = await getProduct({ id });

    if (!product)
      return { props: { product: null, error: 'Produto não encontrado' } };

    return { props: { product } };
  } catch (error) {
    console.error(`Erro ao buscar produto ${id}:`, error);

    return { props: { product: null, error: 'Erro ao buscar produto' } };
  }
};

export default EditProduct;

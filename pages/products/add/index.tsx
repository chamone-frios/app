import { useState } from 'react';

import { Alert, CircularProgress, Stack, Typography } from '@mui/material';
import { Product, ProductLabel, ProductMetric } from 'src/constants/types';
import { http } from 'src/frontend/api/http';
import { ProductForm } from 'src/frontend/components';
import { useIsNextLoading } from 'src/frontend/hooks';

const AddProduct = () => {
  const isNextLoading = useIsNextLoading();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const initialState: Omit<Product, 'id' | 'img' | 'profit_margin'> = {
    name: '',
    description: '',
    maker: '',
    label: ProductLabel.DAIRY,
    metric: ProductMetric.UNIT,
    price: 0.0,
    stock: 0.0,
    purchase_price: 0.0,
  };

  const handleSubmit = async (product: Product) => {
    setIsSubmitting(true);
    try {
      await http.post('/api/v1/products', product);
      setStatus('success');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      setStatus('error');
      setErrorMessage(error.data?.error || 'Erro ao adicionar produto.');
      setIsSubmitting(false);
    }
  };

  const getAlertSeverity = () => {
    if (status === 'success') return 'success';
    if (status === 'error') return 'error';
    return 'info';
  };

  const getAlertMessage = () => {
    if (status === 'success') return 'Produto adicionado com sucesso!';
    if (status === 'error') return errorMessage || 'Erro ao adicionar produto.';
    return 'Preencha corretamente antes de adicionar o produto.';
  };

  return (
    <Stack spacing={4}>
      <Typography variant="hero-sm">Adicionar produto</Typography>
      <Alert severity={getAlertSeverity()} sx={{ alignItems: 'center' }}>
        {getAlertMessage()}
      </Alert>
      {isNextLoading ? (
        <Stack alignItems="center" justifyContent="center" height="300px">
          <CircularProgress />
        </Stack>
      ) : (
        <ProductForm
          clearFormAferSubmit
          isLoading={isSubmitting}
          initialState={initialState}
          submitButtonText="Adicionar produto"
          onSubmit={handleSubmit}
        />
      )}
    </Stack>
  );
};

export default AddProduct;

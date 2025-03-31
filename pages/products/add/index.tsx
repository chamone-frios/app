import { useState } from 'react';

import { Alert, Stack, Typography } from '@mui/material';
import axios from 'axios';
import { Product, ProductMetric } from 'src/constants/types';
import { ProductForm } from 'src/frontend/components';

const AddProduct = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const initialState: Omit<Product, 'id' | 'img'> = {
    name: '',
    description: '',
    maker: '',
    metric: ProductMetric.UNIT,
    price: 0.0,
    stock: 0,
  };

  const handleSubmit = async (product: Product) => {
    setIsLoading(true);
    try {
      await axios.post('/api/v1/products', product);
      setStatus('success');
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      setStatus('error');
      setErrorMessage(
        error.response?.data?.message || 'Erro ao adicionar produto.'
      );
      setIsLoading(false);
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
      <Alert severity={getAlertSeverity()}>{getAlertMessage()}</Alert>
      <ProductForm
        isLoading={isLoading}
        initialState={initialState}
        submitButtonText="Adicionar produto"
        onSubmit={handleSubmit}
      />
    </Stack>
  );
};

export default AddProduct;

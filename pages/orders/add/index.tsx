import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';

import {
  Alert,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { getClients, getProducts } from 'src/backend/database';
import { Client, CreateOrderRequest, Product } from 'src/constants/types';
import { http } from 'src/frontend/api/http';
import { OrderForm } from 'src/frontend/components';
import { useIsNextLoading } from 'src/frontend/hooks';

type AddOrderProps = {
  clients: Client[];
  products: Product[];
};

const AddOrder = ({ clients, products }: AddOrderProps) => {
  const router = useRouter();
  const isNextLoading = useIsNextLoading();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const isMissingInfo = !clients.length || !products.length;

  const initialState: Omit<CreateOrderRequest, 'id'> = {
    notes: '',
    client_id: '',
    items: [{ product_id: '', quantity: 0 }],
    tax: 0,
    discount: 0,
  };

  const handleSubmit = async (order: CreateOrderRequest) => {
    setIsSubmitting(true);
    try {
      await http.post('/api/v1/orders', order);
      setStatus('success');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      setStatus('error');
      setErrorMessage(error.data?.error || 'Erro ao criar pedido.');
      setIsSubmitting(false);
    }
  };

  const getAlertSeverity = () => {
    if (status === 'success') return 'success';
    if (status === 'error') return 'error';
    return 'info';
  };

  const getAlertMessage = () => {
    if (status === 'success') return 'Pedido adicionado com sucesso!';
    if (status === 'error') return errorMessage || 'Erro ao adicionar pedido.';
    return 'Preencha corretamente antes de adicionar o pedido.';
  };

  return (
    <Stack spacing={4}>
      <Typography variant="hero-sm">Criar pedido</Typography>
      <Alert severity={getAlertSeverity()} sx={{ alignItems: 'center' }}>
        {getAlertMessage()}
      </Alert>
      {isNextLoading ? (
        <Stack alignItems="center" justifyContent="center" height="300px">
          <CircularProgress />
        </Stack>
      ) : isMissingInfo ? (
        clients.length === 0 ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={4}
            height="300px"
          >
            <Typography>
              Para criar um pedido, é necessário ter clientes cadastrados! 👨‍🍳
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/clients/add')}
            >
              Cadastrar um cliente
            </Button>
          </Stack>
        ) : (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={4}
            height="300px"
          >
            <Typography>
              Para criar um pedido, é necessário ter produtos cadastrados! 🧀
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/products/add')}
            >
              Cadastrar um produto
            </Button>
          </Stack>
        )
      ) : (
        <OrderForm
          clearFormAferSubmit
          clients={clients}
          products={products}
          isLoading={isSubmitting}
          initialState={initialState}
          submitButtonText="Criar pedido"
          onSubmit={handleSubmit}
        />
      )}
    </Stack>
  );
};

export const getServerSideProps: GetServerSideProps<
  AddOrderProps
> = async () => {
  try {
    const clients = await getClients();
    const products = await getProducts();

    return { props: { clients, products } };
  } catch (error) {
    console.error('Erro ao buscar ordens:', error);
    return { props: { clients: [], products: [] } };
  }
};

export default AddOrder;

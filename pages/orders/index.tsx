import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import {
  Stack,
  Button,
  Divider,
  Typography,
  CircularProgress,
} from '@mui/material';
import { getOrders } from 'src/backend/database';
import { Order } from 'src/constants/types';
import { OrderCard } from 'src/frontend/components';
import { useIsNextLoading } from 'src/frontend/hooks';

type OrdersListProps = {
  orders: Order[];
};

const OrdersList = ({ orders }: OrdersListProps) => {
  const router = useRouter();
  const isNextLoading = useIsNextLoading();

  return (
    <Stack spacing={5}>
      <Stack spacing={4}>
        <Typography variant="hero-sm">Últimos pedidos</Typography>
        <Typography>Esses são os ultimos pedidos feitos! 📦</Typography>
        {orders.length > 0 && (
          <Stack direction="row-reverse" width="100%">
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/orders/add')}
            >
              Adicionar
            </Button>
          </Stack>
        )}
      </Stack>
      <Divider />
      <Stack height="100%" gap={4}>
        {isNextLoading ? (
          <Stack alignItems="center" justifyContent="center" height="300px">
            <CircularProgress />
          </Stack>
        ) : !orders || orders.length === 0 ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={4}
            height="300px"
          >
            <Typography>Nenhum pedido cadastrado 😭</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/orders/add')}
            >
              Novo pedido
            </Button>
          </Stack>
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </Stack>
    </Stack>
  );
};

export const getServerSideProps: GetServerSideProps<
  OrdersListProps
> = async () => {
  try {
    const orders = await getOrders();
    return { props: { orders } };
  } catch (error) {
    console.error('Erro ao buscar ordens:', error);
    return { props: { orders: [] } };
  }
};

export default OrdersList;

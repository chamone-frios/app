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
import { getOrders } from 'src/backend/database';
import { Order } from 'src/constants/types';
import { http } from 'src/frontend/api/http';
import { DeleteModal, OrderCard } from 'src/frontend/components';
import { useIsNextLoading } from 'src/frontend/hooks';

type OrdersListProps = {
  orders: Order[];
};

const OrdersList = ({ orders: initialOrders }: OrdersListProps) => {
  const router = useRouter();
  const isNextLoading = useIsNextLoading();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const handleDeleteClick = (orderId: string) => {
    setOrderToDelete(orderId);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDeleteModalOpen(false);
    setOrderToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;

    setIsDeleting(true);
    handleCloseModal();
    setOrders((currentOrders) =>
      currentOrders.filter((order) => order.id !== orderToDelete)
    );

    try {
      await http.delete(`/api/v1/orders/${orderToDelete}`);
    } catch (error) {
      console.error('Erro ao excluir pedido:', error);
      setOrders(initialOrders);
    } finally {
      setIsDeleting(false);
    }
  };

  const isLoading = isNextLoading || isDeleting;

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
        {isLoading ? (
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
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
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
        <Typography>Deseja realmente excluir este pedido?</Typography>
        <Typography gutterBottom>Esta ação não pode ser desfeita.</Typography>
      </DeleteModal>
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

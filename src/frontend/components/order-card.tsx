'use client';

import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';

import { Card, CardContent, Skeleton, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { Order } from 'src/constants/types';
import { numberToCurrency } from 'src/utils';

import { useIsClient } from '../hooks';

import { CardFields } from './card-fields';
import { OrderMenu } from './order-menu';
import { OrderStatusLabel } from './order-status-label';
import { OrderStatusModal } from './order-status-modal';

export type OrderCardProps = {
  order: Order;
  onDelete: (orderId: string) => void;
};

const OrderCard = ({ order, onDelete }: OrderCardProps) => {
  const router = useRouter();
  const isClient = useIsClient();
  const [status, setStatus] = useState(order.status);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuItems = useMemo(
    () => [
      {
        label: 'Ver detalhes',
        onClick: () => router.push(`/orders/details/${order.id}`),
      },
      {
        label: 'Atualizar status',
        onClick: () => setIsModalOpen(true),
      },
      {
        label: 'Excluir pedido',
        onClick: () => onDelete(order.id),
      },
    ],
    [order.id, router]
  );

  if (!isClient) {
    return <Skeleton variant="rounded" height={190} width="100%" />;
  }

  return (
    <>
      <Card key={order.id}>
        <CardContent>
          <Stack
            width="100%"
            direction="row"
            justifyContent="space-between"
            gap={2}
          >
            <Stack>
              <Typography gutterBottom variant="h6" sx={{ mb: 0 }}>
                {`Pedido de ${order.client_name}`}
              </Typography>
            </Stack>
            <OrderMenu id={order.id} items={menuItems} />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {order.notes}
          </Typography>
          <CardFields
            label="Status: "
            value={<OrderStatusLabel status={status} />}
          />
          <CardFields
            label="Lucro: "
            valueProps={{ color: 'success' }}
            value={numberToCurrency({ number: order.total_profit })}
          />
          <CardFields
            label="Valor total: "
            value={numberToCurrency({ number: order.total })}
          />
          <CardFields
            label="Data do pedido: "
            value={format(new Date(order.created_at), 'dd/MM/yyyy')}
          />
        </CardContent>
      </Card>
      <OrderStatusModal
        orderId={order.id}
        isOpen={isModalOpen}
        currentStatus={status}
        onClose={() => setIsModalOpen(false)}
        onStatusChange={(newStatus) => setStatus(newStatus)}
      />
    </>
  );
};

export { OrderCard };

import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';

import {
  Stack,
  Divider,
  Typography,
  CircularProgress,
  Button,
} from '@mui/material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getOrder } from 'src/backend/database';
import { OrderWithItems } from 'src/constants/types';
import { http } from 'src/frontend/api/http';
import {
  CardFields,
  DeleteModal,
  OrderMenu,
  OrderStatusLabel,
  OrderStatusModal,
} from 'src/frontend/components';
import { useIsNextLoading } from 'src/frontend/hooks';
import { numberToCurrency } from 'src/utils';

type OrderDetailsProps = {
  order: OrderWithItems;
};

const OrderDetails = ({ order }: OrderDetailsProps) => {
  const router = useRouter();
  const isNextLoading = useIsNextLoading();
  const [status, setStatus] = useState(order.status);
  const [isStatusModalOpen, setStatusModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const menuItems = useMemo(
    () => [
      {
        label: 'Atualizar status',
        onClick: () => setStatusModalOpen(true),
      },
      {
        label: 'Excluir pedido',
        onClick: () => setIsDeleteModalOpen(true),
      },
    ],
    [order.id, router]
  );

  const handleCloseModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    handleCloseModal();

    try {
      await http.delete(`/api/v1/orders/${order.id}`);
    } catch (error) {
      console.error('Erro ao excluir pedido:', error);
    } finally {
      setIsDeleting(false);
      router.push('/orders');
    }
  };

  return (
    <Stack spacing={5}>
      <Stack spacing={4}>
        <Typography variant="hero-sm">Detalhamento</Typography>
        <Typography>Veja os detalhes aqui! 📋</Typography>
        <Stack direction="row-reverse" width="100%">
          <Button
            variant="contained"
            color="primary"
            disabled={isDeleting || isNextLoading}
            onClick={() => router.push('/orders')}
          >
            Voltar
          </Button>
        </Stack>
      </Stack>
      <Divider />
      <Stack height="100%">
        {isNextLoading ? (
          <Stack alignItems="center" justifyContent="center" height="300px">
            <CircularProgress />
          </Stack>
        ) : !order ? (
          <Stack alignItems="center" justifyContent="center" height="300px">
            <Typography variant="hero-sm">Pedido não encontrado.</Typography>
            <Typography variant="hero-sm">❌</Typography>
          </Stack>
        ) : (
          <Stack gap={5}>
            <Stack
              sx={{ borderBottom: '1px dashed #e0e0e0', paddingBottom: 4 }}
            >
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6" fontWeight={600}>
                  {`Pedido de ${order.client_name}`}
                </Typography>
                <OrderMenu id={order.id} items={menuItems} />
              </Stack>
              {order.notes && (
                <CardFields label="Observações:" value={order.notes} />
              )}
            </Stack>
            <Stack gap={1}>
              <Typography fontWeight={600}>Informações do cliente:</Typography>
              <CardFields label="Nome do cliente:" value={order.client_name} />
              <CardFields
                label="Tipo de estabelecimento:"
                value={order.client_establishment_type}
              />
              <CardFields
                label="Contato:"
                value={
                  order.client_phone ? (
                    <a
                      href={`https://wa.me/${order.client_phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </a>
                  ) : (
                    'Não informado'
                  )
                }
              />
            </Stack>
            <Stack gap={1}>
              <Typography fontWeight={600}>Informações:</Typography>
              <CardFields
                label="Status:"
                value={<OrderStatusLabel status={status} />}
              />
              <CardFields
                label="Horário:"
                value={format(new Date(order.created_at), 'HH:mm', {
                  locale: ptBR,
                })}
              />
              <CardFields
                label="Data:"
                value={format(new Date(order.created_at), 'dd/MM/yyyy, eeee', {
                  locale: ptBR,
                })}
              />
              {order.tax > 0 && (
                <CardFields
                  label="Taxas:"
                  value={numberToCurrency({ number: order.tax })}
                />
              )}
              {order.discount > 0 && (
                <CardFields
                  label="Descontos:"
                  value={numberToCurrency({ number: order.discount })}
                />
              )}
              <CardFields
                label="Lucro total:"
                valueProps={{ color: 'success' }}
                value={numberToCurrency({ number: order.total_profit })}
              />
              <CardFields
                label="Valor total:"
                value={numberToCurrency({ number: order.total })}
              />
            </Stack>
            <Stack gap={1}>
              <Typography fontWeight={600}>Produtos comprados:</Typography>
              <Stack gap={2}>
                {order.items.length > 0 ? (
                  order.items.map((item) => (
                    <Stack
                      key={item.product_id}
                      direction="row"
                      padding={3}
                      gap={3}
                      sx={(theme) => ({
                        border: `1px solid ${theme.palette.grey[100]}`,
                        borderRadius: theme.spacing(3),
                      })}
                    >
                      <Stack gap={1}>
                        <Typography fontWeight={600}>
                          {item.product_name}
                        </Typography>
                        <CardFields label="Quantidade:" value={item.quantity} />
                        <CardFields
                          label="Lucro total:"
                          valueProps={{ color: 'success' }}
                          value={numberToCurrency({
                            number: item.total_profit,
                          })}
                        />
                        <CardFields
                          label="Preço total:"
                          value={numberToCurrency({ number: item.subtotal })}
                        />
                        <CardFields
                          label="Lucro por unidade:"
                          valueProps={{ color: 'success' }}
                          value={numberToCurrency({
                            number: item.unit_profit,
                          })}
                        />
                        <CardFields
                          label="Preço por unidade:"
                          value={numberToCurrency({ number: item.unit_price })}
                        />
                      </Stack>
                    </Stack>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Nenhum produto adicionado.
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Stack>
        )}
      </Stack>
      <OrderStatusModal
        orderId={order.id}
        isOpen={isStatusModalOpen}
        currentStatus={status}
        onClose={() => setStatusModalOpen(false)}
        onStatusChange={(newStatus) => setStatus(newStatus)}
      />
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

export const getServerSideProps: GetServerSideProps<OrderDetailsProps> = async (
  context
) => {
  const { id } = context.params || {};

  if (!id || typeof id !== 'string') {
    return {
      props: {
        order: null,
        error: 'ID de pedido inválido',
      },
    };
  }

  try {
    const order = await getOrder({ id });
    return { props: { order } };
  } catch (error) {
    console.error('Erro ao buscar ordens:', error);
    return { props: { order: undefined } };
  }
};

export default OrderDetails;

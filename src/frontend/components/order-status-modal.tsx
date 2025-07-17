import { useCallback, useMemo, useState } from 'react';

import { Button, Modal, Paper, Snackbar, Typography } from '@mui/material';
import { Stack, useTheme } from '@mui/system';
import { OrderStatus } from 'src/constants/types';

import { http } from '../api/http';

type OrderStatusModalProps = {
  isOpen: boolean;
  orderId: string;
  currentStatus: OrderStatus;
  onClose: () => void;
  onStatusChange?: (newStatus: OrderStatus) => void;
};

const OrderStatusModal = ({
  isOpen,
  orderId,
  currentStatus,
  onClose,
  onStatusChange,
}: OrderStatusModalProps) => {
  const theme = useTheme();
  const [toast, setToast] = useState<{ open: boolean; color: string }>({
    open: false,
    color: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { color, label } = useMemo(() => {
    if (currentStatus === OrderStatus.PENDING)
      return { color: 'warning', label: 'Pendente' };

    if (currentStatus === OrderStatus.CANCELLED)
      return { color: 'error', label: 'Cancelado' };

    if (currentStatus === OrderStatus.PAID)
      return { color: 'success', label: 'Pago' };
  }, [currentStatus]);

  const updateStatus = useCallback(
    async (newStatus: OrderStatus) => {
      setIsLoading(true);
      try {
        await http.post(`/api/v1/orders/status/${orderId}`, {
          status: newStatus,
        });
        setToast({ open: true, color: theme.palette.content.success });
        setMessage('Status do pedido atualizado com sucesso');
        onStatusChange?.(newStatus);
      } catch (error) {
        console.error(`Erro ao atualizar status do pedido ${orderId}:`, error);
        setToast({ open: true, color: theme.palette.content.warning });
        setMessage('Erro ao atualizar status do pedido');
      } finally {
        setIsLoading(false);
        onClose();
      }
    },
    [orderId, onClose]
  );

  return (
    <>
      <Modal
        open={isOpen}
        onClose={onClose}
        aria-labelledby="order-status-modal-title"
        aria-describedby="order-status-modal-description"
      >
        <Paper
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '85%',
            padding: 6,
            borderRadius: 24,
          }}
        >
          <Typography variant="h6" component="h2" fontWeight={600} gutterBottom>
            Atualize o status do pedido
          </Typography>
          <Stack direction="row" gap={2} marginBottom={4}>
            <Typography>O status atual é</Typography>
            <Typography color={color} fontWeight={600}>
              {label}.
            </Typography>
          </Stack>
          <Typography>Atualize o status do pedido para:</Typography>
          <Stack direction="row" gap={2}>
            {currentStatus !== OrderStatus.PENDING && (
              <Button
                variant="outlined"
                color="warning"
                disabled={isLoading}
                onClick={() => updateStatus(OrderStatus.PENDING)}
              >
                Pendente
              </Button>
            )}
            {currentStatus !== OrderStatus.CANCELLED && (
              <Button
                variant="outlined"
                color="error"
                disabled={isLoading}
                onClick={() => updateStatus(OrderStatus.CANCELLED)}
              >
                Cancelado
              </Button>
            )}
            {currentStatus !== OrderStatus.PAID && (
              <Button
                variant="outlined"
                color="success"
                disabled={isLoading}
                onClick={() => updateStatus(OrderStatus.PAID)}
              >
                Pago
              </Button>
            )}
          </Stack>
          <Stack
            direction="row"
            spacing={4}
            marginTop={6}
            justifyContent="flex-end"
          >
            <Button onClick={onClose} variant="outlined" loading={isLoading}>
              Cancelar
            </Button>
          </Stack>
        </Paper>
      </Modal>
      <Snackbar
        open={toast.open}
        sx={{
          '.MuiPaper-root': {
            background: toast.color,
            color: 'white',
            fontWeight: 600,
          },
        }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        autoHideDuration={6000}
        onClose={() => setToast({ open: false, color: '' })}
        message={message}
      />
    </>
  );
};

export { OrderStatusModal };

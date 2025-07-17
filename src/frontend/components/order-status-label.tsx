import { ReactNode } from 'react';

import { Check, Close, WatchLater } from '@mui/icons-material';
import { Typography, TypographyOwnProps } from '@mui/material';
import { OrderStatus } from 'src/constants/types';

export type OrderStatusLabelProps = {
  status: OrderStatus;
};

const OrderStatusLabel = ({ status }: OrderStatusLabelProps) => {
  switch (status) {
    case OrderStatus.PENDING:
      return (
        <Status
          label="Pendente"
          color="warning"
          icon={<WatchLater fontSize="inherit" color="inherit" />}
        />
      );
    case OrderStatus.CANCELLED:
      return (
        <Status
          label="Cancelado"
          color="error"
          icon={<Close fontSize="inherit" color="inherit" />}
        />
      );
    case OrderStatus.PAID:
      return (
        <Status
          label="Pago"
          color="success"
          icon={<Check fontSize="inherit" color="inherit" />}
        />
      );
    default:
      return status;
  }
};

type StatusProps = {
  label: string;
  color: TypographyOwnProps['color'];
  icon: ReactNode;
};

const Status = ({ label, color, icon }: StatusProps) => (
  <Typography
    gap={2}
    display="flex"
    color={color}
    fontSize="inherit"
    alignItems="center"
    justifyContent="center"
  >
    {icon}
    {label}
  </Typography>
);

export { OrderStatusLabel };

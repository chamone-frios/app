import { ReactNode } from 'react';

import { Stack, Typography, TypographyOwnProps } from '@mui/material';

export type CardFieldsProps = {
  label: string | ReactNode;
  value: string | ReactNode;
  valueProps?: TypographyOwnProps;
};

const CardFields = ({ label, value, valueProps }: CardFieldsProps) => {
  return (
    <Stack direction="row" gap={3} alignItems="center">
      <Typography variant="body2" fontWeight={600} color="textSecondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ cursor: 'pointer' }}
        color="textSecondary"
        {...valueProps}
      >
        {value}
      </Typography>
    </Stack>
  );
};

export { CardFields };

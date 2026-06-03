import { ReactNode } from 'react';

import { Stack, Typography, TypographyOwnProps } from '@mui/material';

export type CardFieldsProps = {
  label: string | ReactNode;
  value: string | ReactNode;
  valueProps?: TypographyOwnProps;
};

const CardFields = ({ label, value, valueProps }: CardFieldsProps) => {
  return (
    <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
      <Typography
        variant="body2"
        color="textSecondary"
        sx={{ fontWeight: 600 }}
      >
        {label}
      </Typography>
      <Typography
        component="div"
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

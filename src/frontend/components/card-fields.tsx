import { ReactNode } from 'react';

import { Stack, Typography } from '@mui/material';

export type CardFieldsProps = {
  label: string | ReactNode;
  value: string | ReactNode;
};

const CardFields = ({ label, value }: CardFieldsProps) => {
  return (
    <Stack direction="row" gap={3} alignItems="center">
      <Typography variant="body2" fontWeight={600} color="textSecondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ cursor: 'pointer' }}
        color="textSecondary"
      >
        {value}
      </Typography>
    </Stack>
  );
};

export { CardFields };

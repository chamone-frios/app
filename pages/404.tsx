import Image from 'next/image';

import { Stack, Typography } from '@mui/material';

const Page404 = () => {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      gap={12}
      sx={{ height: '100%' }}
    >
      <Stack gap={2}>
        <Typography variant="hero-sm">Página não existe</Typography>
        <Typography>Verifique se digitou corretamente</Typography>
      </Stack>
      <Image
        src="/assets/404.png"
        alt="Página não encontrada"
        width={200}
        height={140}
      />
    </Stack>
  );
};

export default Page404;

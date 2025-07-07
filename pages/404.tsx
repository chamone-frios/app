import Image from 'next/image';

import { Stack, Typography } from '@mui/material';
import { useIsMobileUser } from 'src/frontend/hooks';

const Page404 = () => {
  const isMobileUser = useIsMobileUser();

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
        width={isMobileUser ? 200 : 400}
        height={isMobileUser ? 140 : 280}
      />
    </Stack>
  );
};

export default Page404;

import Image from 'next/image';

import { Divider, Stack, Typography } from '@mui/material';
import { useIsMobileUser } from 'src/frontend/hooks';

const Page404 = () => {
  const isMobileUser = useIsMobileUser();

  return (
    <Stack spacing={5}>
      <Stack spacing={4}>
        <Typography variant="hero-sm">Página não existe</Typography>
        <Typography>Verifique se digitou corretamente</Typography>
      </Stack>
      <Divider />
      <Stack alignItems="center" justifyContent="center" height="300px">
        <Image
          src="/assets/404.png"
          alt="Página não encontrada"
          width={isMobileUser ? 200 : 400}
          height={isMobileUser ? 140 : 280}
        />
      </Stack>
    </Stack>
  );
};

export default Page404;

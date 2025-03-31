import Image from 'next/image';

import { Divider, Stack, Typography } from '@mui/material';

const Index = () => {
  return (
    <Stack spacing={8}>
      <Stack spacing={4}>
        <Typography variant="hero-sm">Chamone frios</Typography>
        <Typography>A distribuidora mais pica de BH 🤙</Typography>
      </Stack>
      <Divider />
      <Stack alignItems="center" justifyContent="center" height="300px">
        <Image
          alt="Chamone Frios"
          src="/assets/logo.png"
          width={150}
          height={150}
          style={{ borderRadius: '50%' }}
        />
      </Stack>
    </Stack>
  );
};

export default Index;

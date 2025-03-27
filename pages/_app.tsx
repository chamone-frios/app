import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { PageWrapper } from 'src/components';
import { theme } from 'src/theme';

const queryClient = new QueryClient();

const MyApp = ({ Component, pageProps }: AppProps) => {
  // Renderiza apenas no lado do cliente para testar
  const [isClient, setIsClient] = useState(false);
  console.log('tracking isClient', isClient);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Retorna um placeholder simplificado para o SSR
    return <div>Carregando...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <PageWrapper>
          <Component {...pageProps} />
        </PageWrapper>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default MyApp;

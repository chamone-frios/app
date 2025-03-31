import { AppProps } from 'next/app';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { Loading, PageWrapper } from 'src/frontend/components';
import { theme } from 'src/frontend/theme';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PageWrapper>
        <Loading />
        <Component {...pageProps} />
      </PageWrapper>
    </ThemeProvider>
  );
};

export default MyApp;

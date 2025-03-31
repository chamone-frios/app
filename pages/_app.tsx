import { AppProps } from 'next/app';

import { CircularProgress, Stack } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { PageWrapper } from 'src/frontend/components';
import { useIsNextLoading } from 'src/frontend/hooks';
import { theme } from 'src/frontend/theme';

const MyApp = ({ Component, pageProps }: AppProps) => {
  const isNextLoading = useIsNextLoading();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PageWrapper>
        {isNextLoading ? (
          <Stack alignItems="center" justifyContent="center" flex={1}>
            <CircularProgress />
          </Stack>
        ) : (
          <Component {...pageProps} />
        )}
      </PageWrapper>
    </ThemeProvider>
  );
};

export default MyApp;

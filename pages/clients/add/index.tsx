import { useState } from 'react';

import { Alert, CircularProgress, Stack, Typography } from '@mui/material';
import { Client } from 'src/constants/types';
import { http } from 'src/frontend/api/http';
import { ClientForm } from 'src/frontend/components';
import { useIsNextLoading } from 'src/frontend/hooks';

const AddClient = () => {
  const isNextLoading = useIsNextLoading();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const initialState: Omit<Client, 'id' | 'img'> = {
    name: '',
    establishment_type: '',
    phone: '',
  };

  const handleSubmit = async (client: Client) => {
    setIsSubmitting(true);
    try {
      await http.post('/api/v1/clients', client);
      setStatus('success');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      setStatus('error');
      setErrorMessage(
        error.response?.data?.message || 'Erro ao adicionar cliente.'
      );
      setIsSubmitting(false);
    }
  };

  const getAlertSeverity = () => {
    if (status === 'success') return 'success';
    if (status === 'error') return 'error';
    return 'info';
  };

  const getAlertMessage = () => {
    if (status === 'success') return 'Cliente adicionado com sucesso!';
    if (status === 'error') return errorMessage || 'Erro ao adicionar cliente.';
    return 'Preencha corretamente antes de adicionar o cliente.';
  };

  return (
    <Stack spacing={4}>
      <Typography variant="hero-sm">Adicionar cliente</Typography>
      <Alert severity={getAlertSeverity()} sx={{ alignItems: 'center' }}>
        {getAlertMessage()}
      </Alert>
      {isNextLoading ? (
        <Stack alignItems="center" justifyContent="center" height="300px">
          <CircularProgress />
        </Stack>
      ) : (
        <ClientForm
          clearFormAfterSubmit
          isLoading={isSubmitting}
          initialState={initialState}
          submitButtonText="Adicionar cliente"
          onSubmit={handleSubmit}
        />
      )}
    </Stack>
  );
};

export default AddClient;

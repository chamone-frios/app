import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';

import {
  Alert,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { getClient } from 'src/backend/database';
import { Client } from 'src/constants/types';
import { http } from 'src/frontend/api/http';
import { ClientForm } from 'src/frontend/components';
import { useIsNextLoading } from 'src/frontend/hooks';

type EditClientProps = {
  client: Client | null;
  error?: string;
};

const EditClient = ({ client, error: serverError }: EditClientProps) => {
  const router = useRouter();
  const isNextLoading = useIsNextLoading();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState(serverError || '');

  const handleSubmit = async (updatedClient: Client) => {
    if (!client?.id) return;

    setIsSubmitting(true);
    try {
      await http.patch(`/api/v1/clients/${client.id}`, updatedClient);
      setStatus('success');
      setIsSubmitting(false);
    } catch (err) {
      console.error('Erro ao atualizar cliente:', err);
      setStatus('error');
      setError(err.response?.data?.message || 'Erro ao atualizar cliente.');
      setIsSubmitting(false);
    }
  };

  if (serverError || !client) {
    return (
      <Stack spacing={4}>
        <Typography variant="hero-sm">Editar cliente</Typography>
        <Alert severity="error">
          {serverError || 'Cliente não encontrado'}
        </Alert>
        <Stack direction="row" justifyContent="flex-start">
          <Button onClick={() => router.push('/clients')}>
            Voltar para a lista
          </Button>
        </Stack>
      </Stack>
    );
  }

  const getAlertSeverity = () => {
    if (status === 'success') return 'success';
    if (status === 'error') return 'error';
    return 'info';
  };

  const getAlertMessage = () => {
    if (status === 'success') return 'Cliente editado com sucesso!';
    if (status === 'error') return error || 'Erro ao editar cliente.';
    return 'Preencha corretamente antes de editar o cliente.';
  };

  return (
    <Stack spacing={4}>
      <Typography variant="hero-sm">Editar cliente</Typography>
      <Alert severity={getAlertSeverity()} sx={{ alignItems: 'center' }}>
        {getAlertMessage()}
      </Alert>
      {isNextLoading ? (
        <Stack alignItems="center" justifyContent="center" height="300px">
          <CircularProgress />
        </Stack>
      ) : (
        <ClientForm
          isLoading={isSubmitting}
          initialState={{
            establishment_type: client.establishment_type,
            name: client.name,
            phone: client.phone,
            maps_link: client.maps_link,
          }}
          submitButtonText="Confirmar edição"
          onSubmit={handleSubmit}
        />
      )}
    </Stack>
  );
};

export const getServerSideProps: GetServerSideProps<EditClientProps> = async (
  context
) => {
  const { id } = context.params || {};

  if (!id || typeof id !== 'string') {
    return {
      props: {
        client: null,
        error: 'ID de cliente inválido',
      },
    };
  }

  try {
    const client = await getClient({ id });

    if (!client)
      return { props: { client: null, error: 'Cliente não encontrado' } };

    return { props: { client } };
  } catch (error) {
    console.error(`Erro ao buscar cliente ${id}:`, error);

    return { props: { client: null, error: 'Erro ao buscar cliente' } };
  }
};

export default EditClient;

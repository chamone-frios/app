import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';

import {
  Stack,
  Button,
  Divider,
  Typography,
  CircularProgress,
} from '@mui/material';
import { getClients } from 'src/backend/database';
import { Client } from 'src/constants/types';
import { http } from 'src/frontend/api/http';
import { ClientCard, DeleteModal } from 'src/frontend/components';
import { useIsNextLoading } from 'src/frontend/hooks';

type ClientListProps = {
  clients: Client[];
};

const ClientList = ({ clients: initialClients }: ClientListProps) => {
  const router = useRouter();
  const isNextLoading = useIsNextLoading();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditClick = (clientId: string) => {
    router.push(`/clients/edit/${clientId}`);
  };

  const handleDeleteClick = (clientId: string) => {
    setClientToDelete(clientId);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDeleteModalOpen(false);
    setClientToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;

    setIsDeleting(true);
    handleCloseModal();
    setClients((currentClients) =>
      currentClients.filter((client) => client.id !== clientToDelete)
    );

    try {
      await http.delete(`/api/v1/clients/${clientToDelete}`);
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      setClients(initialClients);
    } finally {
      setIsDeleting(false);
    }
  };

  const isLoading = isDeleting || isNextLoading;

  return (
    <Stack spacing={5}>
      <Stack spacing={4}>
        <Typography variant="hero-sm">Clientes</Typography>
        <Typography>Esses são nossos clients! 👨‍🍳</Typography>
        {clients.length > 0 && (
          <Stack direction="row-reverse" sx={{ width: '100%' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/clients/add')}
            >
              Adicionar
            </Button>
          </Stack>
        )}
      </Stack>
      <Divider />
      <Stack sx={{ height: '100%' }} spacing={4}>
        {isLoading ? (
          <Stack
            sx={{
              alignItems: 'center',
              justifyContent: 'center',
              height: '300px',
            }}
          >
            <CircularProgress />
          </Stack>
        ) : !clients || clients.length === 0 ? (
          <Stack
            spacing={4}
            sx={{
              alignItems: 'center',
              justifyContent: 'center',
              height: '300px',
            }}
          >
            <Typography>Nenhum cliente cadastrado 😭</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/clients/add')}
            >
              Novo cliente
            </Button>
          </Stack>
        ) : (
          clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))
        )}
      </Stack>
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
      >
        <Typography>Deseja realmente excluir este cliente?</Typography>
        <Typography gutterBottom>Esta ação não pode ser desfeita.</Typography>
      </DeleteModal>
    </Stack>
  );
};

export const getServerSideProps: GetServerSideProps<
  ClientListProps
> = async () => {
  try {
    const clients = await getClients();
    return { props: { clients } };
  } catch (error) {
    console.error('Erro ao buscar Clientes:', error);
    return { props: { clients: [] } };
  }
};

export default ClientList;

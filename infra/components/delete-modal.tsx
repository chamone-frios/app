import { PropsWithChildren } from 'react';

import { Button, Modal, Paper, Typography } from '@mui/material';
import { Stack } from '@mui/system';

type DeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const DeleteModal = ({
  children,
  isOpen,
  onClose,
  onConfirm,
}: PropsWithChildren<DeleteModalProps>) => (
  <Modal
    open={isOpen}
    onClose={onClose}
    aria-labelledby="delete-modal-title"
    aria-describedby="delete-modal-description"
  >
    <Paper
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        padding: 6,
        borderRadius: 24,
      }}
    >
      <Typography variant="h6" component="h2" fontWeight={600} gutterBottom>
        Confirmar deleção
      </Typography>
      {children}
      <Stack
        direction="row"
        spacing={4}
        marginTop={6}
        justifyContent="flex-end"
      >
        <Button onClick={onClose} variant="outlined">
          Voltar
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          Deletar
        </Button>
      </Stack>
    </Paper>
  </Modal>
);

export { DeleteModal };

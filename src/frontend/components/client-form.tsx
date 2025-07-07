import { useRouter } from 'next/router';
import { ChangeEvent, useState } from 'react';

import {
  Button,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Client } from 'src/constants/types';

type ClientFormProps = {
  isLoading: boolean;
  submitButtonText: string;
  initialState: Omit<Client, 'id'>;
  clearFormAfterSubmit?: boolean;
  onSubmit: (client: Omit<Client, 'id'>) => void;
};

const ClientForm = ({
  isLoading,
  submitButtonText,
  initialState,
  clearFormAfterSubmit,
  onSubmit,
}: ClientFormProps) => {
  const router = useRouter();
  const [client, setClient] = useState<Omit<Client, 'id'>>(initialState);

  const [errors, setErrors] = useState<Partial<Record<keyof Client, string>>>(
    {}
  );

  const onValueChange = (value: string, key: keyof Client) => {
    setClient((previous) => ({ ...previous, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const formattedValue = value.replace(/(?!^\+)\D/g, '');
    onValueChange(formattedValue, 'phone');
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof Client, string>> = {};

    if (!client.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!client.establishment_type.trim()) {
      newErrors.establishment_type = 'Tipo de estabelecimento é obrigatório';
    }

    if (client.phone.trim() === '') {
      newErrors.phone = 'Telefone não pode ser vazio se fornecido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    await onSubmit({
      name: client.name.trim(),
      establishment_type: client.establishment_type.trim(),
      phone: client.phone?.trim() || undefined,
      maps_link: client.maps_link?.trim() || undefined,
    });

    if (clearFormAfterSubmit) {
      setClient(initialState);
    }
  };

  return (
    <Stack spacing={4}>
      <Stack direction="row" width="100%">
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.back()}
        >
          Voltar
        </Button>
      </Stack>
      <Divider />
      <Typography variant="h6">Informações do cliente</Typography>
      <Stack spacing={4}>
        <TextField
          label="Nome"
          value={client.name}
          onChange={(event) => onValueChange(event.target.value, 'name')}
          error={!!errors.name}
          helperText={errors.name}
          required
          fullWidth
        />
        <TextField
          label="Tipo de estabelecimento"
          value={client.establishment_type}
          onChange={(event) =>
            onValueChange(event.target.value, 'establishment_type')
          }
          error={!!errors.establishment_type}
          helperText={errors.establishment_type}
          required
          fullWidth
          placeholder="ex: Restaurante, Café, Bar, Hotel"
        />
        <TextField
          label="Telefone"
          value={client.phone || ''}
          onChange={handlePhoneChange}
          error={!!errors.phone}
          helperText={errors.phone}
          fullWidth
          required
          placeholder="ex: +55 11 99999-9999"
        />
        <TextField
          label="Link do Google Maps"
          value={client.maps_link || ''}
          onChange={(event) => onValueChange(event.target.value, 'maps_link')}
          error={!!errors.maps_link}
          helperText={errors.maps_link}
          fullWidth
          placeholder="ex: https://maps.google.com/..."
        />
      </Stack>
      <Stack alignItems="flex-end" sx={{ paddingTop: 4 }}>
        <Button variant="contained" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? <CircularProgress size={20} /> : submitButtonText}
        </Button>
      </Stack>
    </Stack>
  );
};

export { ClientForm };

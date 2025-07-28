import { useMemo } from 'react';

import { Card, CardContent, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { Client } from 'src/constants/types';

import { CardFields } from './card-fields';
import { Menu } from './menu';

type ClientCardProps = {
  client: Client;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const ClientCard = ({ client, onDelete, onEdit }: ClientCardProps) => {
  const menuItems = useMemo(
    () => [
      {
        label: 'Editar',
        onClick: () => onEdit(client.id),
      },
      {
        label: 'Excluir',
        onClick: () => onDelete(client.id),
      },
    ],
    [client.id, onDelete, onEdit]
  );

  return (
    <Card key={client.id}>
      <CardContent>
        <Stack width="100%" direction="row" justifyContent="space-between">
          <Stack>
            <Typography gutterBottom variant="h6" sx={{ mb: 0 }}>
              {client.name}
            </Typography>
          </Stack>
          <Menu id={client.id} items={menuItems} />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {client.establishment_type}
        </Typography>
        <CardFields
          label="Contato:"
          value={
            client.phone ? (
              <a
                href={`https://wa.me/${client.phone}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            ) : (
              'Não informado'
            )
          }
        />
        <CardFields
          label="Endereço:"
          value={
            client.maps_link ? (
              <a
                href={client.maps_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Maps
              </a>
            ) : (
              'Não informado'
            )
          }
        />
      </CardContent>
    </Card>
  );
};

export { ClientCard };

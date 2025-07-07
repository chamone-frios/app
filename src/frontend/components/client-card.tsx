import { Delete, Edit } from '@mui/icons-material';
import { Card, CardContent, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { Client } from 'src/constants/types';

import { CardFields } from './card-fields';

type ClientCardProps = {
  client: Client;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const ClientCard = ({ client, onDelete, onEdit }: ClientCardProps) => {
  return (
    <Card key={client.id}>
      <CardContent>
        <Stack width="100%" direction="row" justifyContent="space-between">
          <Stack>
            <Typography gutterBottom variant="h6" sx={{ mb: 0 }}>
              {client.name}
            </Typography>
          </Stack>
          <Stack
            gap={2}
            sx={{
              marginTop: 2,
              justifySelf: 'center',
              alignItems: 'center',
              width: 'fit-content',
            }}
          >
            <Stack direction="row" gap={4}>
              <Stack onClick={() => onEdit(client.id)}>
                <Edit fontSize="small" />
              </Stack>
              <Stack onClick={() => onDelete(client.id)}>
                <Delete fontSize="small" />
              </Stack>
            </Stack>
          </Stack>
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

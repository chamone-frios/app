import { useMemo } from 'react';

import { Card, CardContent, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { Product } from 'src/constants/types';
import { getMetricLabel } from 'src/utils';
import { formatNumber, numberToCurrency } from 'src/utils/number';

import { CardFields } from './card-fields';
import { Menu } from './menu';

type ProductCardProps = {
  product: Product;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const ProductCard = ({ product, onDelete, onEdit }: ProductCardProps) => {
  const menuItems = useMemo(
    () => [
      {
        label: 'Editar',
        onClick: () => onEdit(product.id),
      },
      {
        label: 'Excluir',
        onClick: () => onDelete(product.id),
      },
    ],
    [product.id, onDelete, onEdit]
  );

  return (
    <Card key={product.id}>
      <CardContent>
        <Stack
          width="100%"
          direction="row"
          justifyContent="space-between"
          gap={2}
        >
          <Stack>
            <Typography gutterBottom variant="h6" sx={{ mb: 0 }}>
              {product.name}
            </Typography>
          </Stack>
          <Menu id={product.id} items={menuItems} />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {product.description}
        </Typography>
        <CardFields label="Fabricante:" value={product.maker} />
        <CardFields
          label="Estoque:"
          value={`${formatNumber({ number: product.stock })} ${getMetricLabel(product.metric)}`}
        />
        <CardFields
          label="Preço de venda:"
          value={`${numberToCurrency({ number: product.price })} / ${getMetricLabel(product.metric).replace(/s$/, '').toLowerCase()}`}
        />
        <CardFields
          label="Preço de compra:"
          value={`${numberToCurrency({ number: product.purchase_price })} / ${getMetricLabel(product.metric).replace(/s$/, '').toLowerCase()}`}
        />
        <CardFields
          label="Lucro:"
          valueProps={{ color: 'success' }}
          value={`${numberToCurrency({ number: product.profit_margin })} / ${getMetricLabel(product.metric).replace(/s$/, '').toLowerCase()}`}
        />
      </CardContent>
    </Card>
  );
};

export { ProductCard };

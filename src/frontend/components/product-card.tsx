import { Delete, Edit } from '@mui/icons-material';
import { Card, CardContent, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { Product } from 'src/constants/types';
import { getMetricLabel } from 'src/utils';
import { numberToCurrency } from 'src/utils/number';

import { CardFields } from './card-fields';

type ProductCardProps = {
  product: Product;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const ProductCard = ({ product, onDelete, onEdit }: ProductCardProps) => (
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
            <Stack onClick={() => onEdit(product.id)}>
              <Edit fontSize="small" />
            </Stack>
            <Stack onClick={() => onDelete(product.id)}>
              <Delete fontSize="small" />
            </Stack>
          </Stack>
        </Stack>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {product.description}
      </Typography>
      <CardFields label="Fabricante:" value={product.maker} />
      <CardFields
        label="Estoque:"
        value={`${product.stock} ${getMetricLabel(product.metric)}`}
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

export { ProductCard };

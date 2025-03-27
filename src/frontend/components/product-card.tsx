import { Delete, Edit } from '@mui/icons-material';
import { Card, CardContent, Chip, Typography } from '@mui/material';
import { Box, Container, Stack } from '@mui/system';
import { Product, ProductMetric } from 'src/constants/types';
import { numberToCurrency } from 'src/utils/number';

type ProductCardProps = {
  product: Product;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const ProductCard = ({ product, onDelete, onEdit }: ProductCardProps) => {
  const getMetricLabel = (metric: ProductMetric): string => {
    switch (metric) {
      case ProductMetric.UNIT:
        return 'Unidades';
      case ProductMetric.KG:
        return 'Quilos';
      case ProductMetric.G:
        return 'Gramas';
      case ProductMetric.L:
        return 'Litros';
      default:
        return '';
    }
  };

  return (
    <Card key={product.id}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between">
          <Chip
            label={`Estoque: ${product.stock} ${getMetricLabel(product.metric)}`}
            color={product.stock > 0 ? 'success' : 'error'}
            size="small"
          />
          <Stack direction="row" justifyContent="end" marginBottom={4} gap={4}>
            <Container onClick={() => onEdit(product.id)}>
              <Edit />
            </Container>
            <Container onClick={() => onDelete(product.id)}>
              <Delete />
            </Container>
          </Stack>
        </Stack>
        <Typography gutterBottom variant="h6" component="div">
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {product.description}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fabricante: {product.maker}
        </Typography>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            {numberToCurrency({ number: product.price })}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export { ProductCard };

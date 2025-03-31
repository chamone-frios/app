import { useRouter } from 'next/router';
import { ChangeEvent, useState } from 'react';

import {
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Product, ProductMetric } from 'src/constants/types';
import { numberToCurrency } from 'src/utils/number';

type ProductFormProps = {
  isLoading: boolean;
  submitButtonText: string;
  initialState: Omit<Product, 'id' | 'img'>;
  onSubmit: (product: Omit<Product, 'id'>) => void;
};

const ProductForm = ({
  isLoading,
  submitButtonText,
  initialState,
  onSubmit,
}: ProductFormProps) => {
  const router = useRouter();
  const [product, setProduct] =
    useState<Omit<Product, 'id' | 'img'>>(initialState);

  const [errors, setErrors] = useState<Partial<Record<keyof Product, string>>>(
    {}
  );

  const onValueChange = (value: string | number, key: keyof Product) => {
    setProduct((previous) => ({ ...previous, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof Product, string>> = {};

    if (!product.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!product.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!product.maker.trim()) {
      newErrors.maker = 'Fabricante é obrigatório';
    }

    if (product.price <= 0) {
      newErrors.price = 'Preço deve ser maior que zero';
    }

    if (product.stock < 0) {
      newErrors.stock = 'Estoque não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value.replace(/[^0-9.,]/g, '');

    const numericValue = parseFloat(rawValue.replace(',', '.')) || 0;

    onValueChange(numericValue, 'price');
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    await onSubmit({
      name: product.name.trim(),
      description: product.description.trim(),
      maker: product.maker.trim(),
      stock: Number(product.stock),
      metric: Number(product.metric),
      price: Number(product.price),
      img: product.name.replace(/\s/g, '-').toLowerCase(),
    });
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
      <Typography variant="h6">Informações do produto</Typography>
      <Stack spacing={4}>
        <TextField
          label="Nome"
          value={product.name}
          onChange={(event) => onValueChange(event.target.value, 'name')}
          error={!!errors.name}
          helperText={errors.name}
          required
          fullWidth
        />
        <TextField
          label="Descrição"
          value={product.description}
          onChange={(event) => onValueChange(event.target.value, 'description')}
          error={!!errors.description}
          helperText={errors.description}
          required
          fullWidth
          multiline
          rows={3}
        />
        <TextField
          label="Fabricante"
          value={product.maker}
          onChange={(event) => onValueChange(event.target.value, 'maker')}
          error={!!errors.maker}
          helperText={errors.maker}
          required
          fullWidth
        />
      </Stack>
      <Typography variant="h6">Informações do estoque</Typography>
      <Stack>
        <Stack spacing={4}>
          <TextField
            required
            fullWidth
            label="Preço"
            value={numberToCurrency({ number: product.price })}
            onChange={handlePriceChange}
            error={!!errors.price}
            helperText={errors.price}
            inputProps={{ inputMode: 'decimal' }}
          />
          <FormControl fullWidth>
            <FormLabel>Métrica do Produto</FormLabel>
            <RadioGroup
              value={product.metric}
              onChange={(e) => onValueChange(e.target.value, 'metric')}
              row
            >
              <FormControlLabel
                value={ProductMetric.UNIT}
                control={<Radio />}
                label="Unidade"
              />
              <FormControlLabel
                value={ProductMetric.KG}
                control={<Radio />}
                label="Quilograma"
              />
              <FormControlLabel
                value={ProductMetric.G}
                control={<Radio />}
                label="Grama"
              />
              <FormControlLabel
                value={ProductMetric.L}
                control={<Radio />}
                label="Litro"
              />
            </RadioGroup>
          </FormControl>
          <TextField
            type="number"
            label="Unidades no estoque"
            value={product.stock}
            onChange={(event) =>
              onValueChange(Number(event.target.value), 'stock')
            }
            error={!!errors.stock}
            helperText={errors.stock}
            required
            fullWidth
          />
        </Stack>
      </Stack>
      <Stack alignItems="flex-end" sx={{ paddingTop: 4 }}>
        <Button variant="contained" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? <CircularProgress size={20} /> : submitButtonText}
        </Button>
      </Stack>
    </Stack>
  );
};

export { ProductForm };

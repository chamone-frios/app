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
  clearFormAferSubmit?: boolean;
  onSubmit: (product: Omit<Product, 'id'>) => void;
};

const MAX_INPUT_CHARACTERS = 15;

const ProductForm = ({
  isLoading,
  submitButtonText,
  initialState,
  clearFormAferSubmit,
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

  const handlePriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (value.length > MAX_INPUT_CHARACTERS) return;

    const numericValue = value.replace(/\D/g, '').padStart(3, '0');
    const formattedValue = `${numericValue.slice(0, -2)}.${numericValue.slice(-2)}`;

    onValueChange(formattedValue, 'price');
  };

  const handleStockChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const formattedValue = value.replace(/(?!^\+)\D/g, '');
    onValueChange(formattedValue, 'stock');
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

    if (!product.stock || product.stock < 0) {
      newErrors.stock = 'Estoque não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    if (clearFormAferSubmit) {
      setProduct(initialState);
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
            onChange={handleStockChange}
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

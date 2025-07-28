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
import { getMetricLabel } from 'src/utils';
import { formatDecimalInputs, numberToCurrency } from 'src/utils/number';

type ProductFormProps = {
  isLoading: boolean;
  submitButtonText: string;
  initialState: Omit<Product, 'id' | 'img' | 'profit_margin'>;
  clearFormAferSubmit?: boolean;
  onSubmit: (product: Omit<Product, 'id' | 'profit_margin'>) => void;
};

const ProductForm = ({
  isLoading,
  submitButtonText,
  initialState,
  clearFormAferSubmit,
  onSubmit,
}: ProductFormProps) => {
  const router = useRouter();
  const [product, setProduct] =
    useState<Omit<Product, 'id' | 'img' | 'profit_margin'>>(initialState);

  const [errors, setErrors] = useState<Partial<Record<keyof Product, string>>>(
    {}
  );

  const onValueChange = (value: string | number, key: keyof Product) => {
    setProduct((previous) => ({ ...previous, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleNumberInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: keyof Product
  ) => {
    const value = event.target.value;
    const formattedValue = formatDecimalInputs({
      value,
      decimalPlaces: key === 'stock' ? 3 : 2,
    });
    if (!formattedValue) return;

    onValueChange(formattedValue, key);
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

    if (!product.purchase_price || product.purchase_price < 0) {
      newErrors.purchase_price = 'Preço de compra não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    await onSubmit({
      name: product.name.trim(),
      description: product.description.trim(),
      maker: product.maker.trim(),
      stock: Number(product.stock),
      metric: Number(product.metric),
      price: Number(product.price),
      purchase_price: Number(product.purchase_price),
      img: product.name.replace(/\s/g, '-').toLowerCase(),
    });
    if (clearFormAferSubmit) {
      setProduct(initialState);
    }
  };

  return (
    <Stack spacing={4}>
      <Stack direction="row" width="100%" justifyContent="end">
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
      <Stack gap={6}>
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
        <TextField
          required
          fullWidth
          label="Preço de venda"
          value={numberToCurrency({ number: product.price })}
          onChange={(event) => handleNumberInputChange(event, 'price')}
          error={!!errors.price}
          helperText={errors.price}
        />
        <TextField
          required
          fullWidth
          label="Preço de compra"
          value={numberToCurrency({ number: product.purchase_price })}
          onChange={(event) => handleNumberInputChange(event, 'purchase_price')}
          error={!!errors.purchase_price}
          helperText={errors.purchase_price}
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
          label={`${getMetricLabel(product.metric)} no estoque`}
          value={formatDecimalInputs({
            value: product.stock.toString() || '0.000',
            decimalPlaces: 3,
          })}
          onChange={(event) => handleNumberInputChange(event, 'stock')}
          error={!!errors.stock}
          helperText={errors.stock}
          required
          fullWidth
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

export { ProductForm };

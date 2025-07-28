import { useRouter } from 'next/router';
import { ChangeEvent, useMemo, useState } from 'react';

import {
  AddCircleOutlineRounded,
  RemoveCircleOutlineRounded,
} from '@mui/icons-material';
import {
  Autocomplete,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Client, CreateOrderRequest, Product } from 'src/constants/types';
import { formatDecimalInputs, numberToCurrency } from 'src/utils/number';

import { Intersperse } from './intersperse';

type OrderFormProps = {
  clients: Client[];
  products: Product[];
  isLoading: boolean;
  submitButtonText: string;
  initialState: Omit<CreateOrderRequest, 'id'>;
  clearFormAferSubmit?: boolean;
  onSubmit: (product: Omit<CreateOrderRequest, 'id'>) => void;
};

type OrderItem = {
  product_id: string;
  quantity: number;
};

type ErrorItems = Partial<Record<keyof OrderItem, string>>;

type Errors = {
  client_id?: string;
  items?: ErrorItems[];
};

const OrderForm = ({
  clients,
  products,
  isLoading,
  submitButtonText,
  initialState,
  clearFormAferSubmit,
  onSubmit,
}: OrderFormProps) => {
  const router = useRouter();

  const [order, setOrder] =
    useState<Omit<CreateOrderRequest, 'id'>>(initialState);
  const [errors, setErrors] = useState<Errors>({ client_id: '', items: [] });

  const clientOptions = useMemo(
    () =>
      clients.map((client) => ({
        label: client.name,
        id: client.id,
      })),
    [clients]
  );

  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        label: `${product.name} (${numberToCurrency({ number: product.price })})`,
        id: product.id,
      })),
    [products]
  );

  const total = useMemo(
    () =>
      order.items.reduce((acc, item) => {
        const product = products.find((p) => p.id === item.product_id);
        if (!product) return acc;
        return acc + Number(product.price) * Number(item.quantity);
      }, 0) +
      Number(order.tax) -
      Number(order.discount),
    [products, order]
  );

  const totalProfit = useMemo(() => {
    const itemsProfit = order.items.reduce((acc, item) => {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) return acc;
      return (
        acc +
        (Number(product.price) - Number(product.purchase_price || 0)) *
          item.quantity
      );
    }, 0);
    return itemsProfit + Number(order.tax) - Number(order.discount);
  }, [products, order]);

  const onOrderItemChange = (
    value: string | number,
    key: keyof OrderItem,
    index: number
  ) => {
    setOrder((prev) => ({
      ...prev,
      items: prev.items.map((item, idx) =>
        idx === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const onClientChange = (value: string) => {
    const client = clients.find((c) => c.id === value);
    if (!client) return;

    setOrder((prev) => ({
      ...prev,
      client_id: value,
      client_name: client.name,
      client_phone: client.phone,
      client_establishment_type: client.establishment_type,
    }));
  };

  const onValueChange = (
    value: string | number,
    key: keyof CreateOrderRequest
  ) => {
    setOrder((previous) => ({ ...previous, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleNumberInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    callback: (value: string) => void,
    { decimalPlaces = 2 } = {}
  ) => {
    const value = event.target.value;
    const formattedValue = formatDecimalInputs({ value, decimalPlaces });
    if (!formattedValue) return;

    callback(formattedValue);
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = { client_id: '', items: [] };

    if (!order.client_id) {
      newErrors.client_id = 'Selecione um cliente';
    }

    order.items.forEach((item, index) => {
      newErrors.items[index] = {};
      if (!item.product_id) {
        newErrors.items[index].product_id = 'Selecione um produto';
      }

      if (!item.quantity || item.quantity <= 0) {
        newErrors.items[index].quantity = 'Quantidade deve ser maior que 0';
      }
    });

    setErrors(newErrors);
    if (
      newErrors.client_id ||
      newErrors.items.some((item) => Object.keys(item).length > 0)
    ) {
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    await onSubmit({
      client_id: order.client_id,
      items: order.items.map((item) => ({
        product_id: item.product_id,
        quantity: Number(item.quantity),
      })),
      discount: Number(order.discount),
      tax: Number(order.tax),
      notes: order.notes,
    });

    if (clearFormAferSubmit) {
      setOrder(initialState);
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
      <Typography variant="h6">Informações do pedido</Typography>
      <Stack gap={6}>
        <FormControl fullWidth>
          <Autocomplete
            noOptionsText="Nenhum cliente encontrado"
            options={clientOptions}
            onChange={(_, value) => onClientChange(value.id)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Cliente"
                error={!!errors.client_id}
              />
            )}
          />
          {errors.client_id && (
            <Typography color="error" variant="caption">
              {errors.client_id}
            </Typography>
          )}
        </FormControl>
        <Stack
          padding={4}
          gap={4}
          sx={(theme) => ({
            border: `1px solid ${theme.palette.grey[100]}`,
            borderRadius: theme.spacing(3),
          })}
        >
          <Typography color="textSecondary">Produtos</Typography>
          <Stack>
            {order.items.length === 0 && (
              <Typography color="error" variant="caption">
                Adicione produtos ao pedido
              </Typography>
            )}
            <Stack gap={4}>
              <Intersperse
                elements={order.items.map((item, index) => (
                  <Stack gap={3} marginTop={2}>
                    <Stack
                      direction="row"
                      gap={3}
                      key={`product-item-${index}`}
                    >
                      <FormControl fullWidth>
                        <Autocomplete
                          id={`product-${index}`}
                          noOptionsText="Nenhum produto encontrado"
                          options={productOptions}
                          onChange={(_, value) =>
                            onOrderItemChange(value.id, 'product_id', index)
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Produto"
                              error={!!errors.items?.[index]?.product_id}
                            />
                          )}
                        />
                      </FormControl>
                      <TextField
                        required
                        type="number"
                        label="Quantidade"
                        value={formatDecimalInputs({
                          value: item.quantity.toString() || '0.000',
                          decimalPlaces: 3,
                        })}
                        onChange={(e) =>
                          handleNumberInputChange(
                            e,
                            (value) =>
                              onOrderItemChange(value, 'quantity', index),
                            { decimalPlaces: 3 }
                          )
                        }
                        error={!!errors.items?.[index]?.quantity}
                      />
                      <IconButton
                        onClick={() =>
                          setOrder((prev) => ({
                            ...prev,
                            items: prev.items.filter((_, idx) => idx !== index),
                          }))
                        }
                      >
                        <RemoveCircleOutlineRounded
                          fontSize="small"
                          color="error"
                        />
                      </IconButton>
                    </Stack>
                    {(errors.items?.[index]?.product_id ||
                      errors.items?.[index]?.quantity) && (
                      <Typography color="error" variant="caption">
                        Selecione um produto e sua quantidade
                      </Typography>
                    )}
                  </Stack>
                ))}
                inBetween={<Divider variant="middle" />}
              />
            </Stack>
          </Stack>
          <IconButton
            onClick={() =>
              setOrder((prev) => ({
                ...prev,
                items: [...prev.items, { product_id: '', quantity: 0 }],
              }))
            }
          >
            <AddCircleOutlineRounded fontSize="small" color="success" />
          </IconButton>
        </Stack>
        <TextField
          fullWidth
          label="Taxas opcionais"
          value={numberToCurrency({ number: order.tax })}
          onChange={(e) =>
            handleNumberInputChange(e, (value) => onValueChange(value, 'tax'))
          }
        />
        <TextField
          fullWidth
          label="Descontos opcionais"
          value={numberToCurrency({ number: order.discount })}
          onChange={(e) =>
            handleNumberInputChange(e, (value) =>
              onValueChange(value, 'discount')
            )
          }
        />
        <TextField
          fullWidth
          label="Observações"
          value={order.notes || ''}
          onChange={(e) => onValueChange(e.target.value, 'notes')}
          multiline
          rows={2}
        />
      </Stack>
      <Stack alignItems="flex-end" gap={3} sx={{ paddingTop: 4 }}>
        <Stack
          width="100%"
          padding={3}
          gap={3}
          sx={(theme) => ({
            border: `1px solid ${theme.palette.grey[100]}`,
            borderRadius: theme.spacing(3),
          })}
        >
          <Stack direction="row" justifyContent="space-between">
            <Typography>Total do pedido:</Typography>
            <Typography
              fontWeight={600}
              color={total < 0 ? 'error' : 'textPrimary'}
            >
              {numberToCurrency({ number: total })}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography>Lucro do pedido:</Typography>
            <Typography
              fontWeight={600}
              color={
                totalProfit === 0
                  ? 'textPrimary'
                  : totalProfit > 0
                    ? 'success'
                    : 'error'
              }
            >
              {numberToCurrency({ number: totalProfit })}
            </Typography>
          </Stack>
        </Stack>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || total <= 0}
        >
          {isLoading ? <CircularProgress size={20} /> : submitButtonText}
        </Button>
      </Stack>
    </Stack>
  );
};

export { OrderForm };

const MAX_INPUT_CHARACTERS = 15;

type NumberToCurrencyProps = {
  number: number;
  digits?: number;
};

export function numberToCurrency({
  number,
  digits = 2,
}: NumberToCurrencyProps) {
  const currencyString = new Intl.NumberFormat('pt', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: digits,
    currencyDisplay: 'narrowSymbol',
  }).format(number);

  return currencyString;
}

export function formatDecimalInputs(value: string): string | undefined {
  if (value.length > MAX_INPUT_CHARACTERS) return;

  const numericValue = value.replace(/\D/g, '').padStart(3, '0');
  const formattedValue = `${numericValue.slice(0, -2)}.${numericValue.slice(-2)}`;

  const parsedValue = formattedValue
    .replace(/^00\./, '0.')
    .replace(/^0(\d+\.\d{2})$/, '$1');

  return parsedValue;
}

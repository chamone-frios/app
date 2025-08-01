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

export function formatNumber({
  number,
  digits = 3,
}: {
  number: number;
  digits?: number;
}) {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(number);
}

export function formatDecimalInputs({
  value,
  decimalPlaces = 2,
}: {
  value: string;
  decimalPlaces?: number;
}): string | undefined {
  if (value.length > MAX_INPUT_CHARACTERS) return;

  const numericValue = value
    .replace(/\D/g, '')
    .padStart(decimalPlaces + 1, '0');
  const formattedValue = `${numericValue.slice(0, -decimalPlaces)}.${numericValue.slice(-decimalPlaces)}`;

  const zeroPattern = new RegExp(`^${'0'.repeat(decimalPlaces)}\\.`, '');
  const formatPattern = new RegExp(`^0(\\d+\\.\\d{${decimalPlaces}})$`, '');

  const parsedValue = formattedValue
    .replace(zeroPattern, '0.')
    .replace(formatPattern, '$1');

  return parsedValue;
}

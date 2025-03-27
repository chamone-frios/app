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

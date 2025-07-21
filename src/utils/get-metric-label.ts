import { ProductMetric } from 'src/constants/types';

const getMetricLabel = (metric: ProductMetric): string => {
  switch (Number(metric)) {
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

export { getMetricLabel };

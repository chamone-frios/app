import { ProductLabel } from 'src/constants/types';

const getProductLabel = (label: number): string => {
  switch (label) {
    case ProductLabel.DAIRY:
      return 'Laticínios';
    case ProductLabel.MEATS:
      return 'Carnes';
    case ProductLabel.HAMBURGERS:
      return 'Hambúrgueres';
    case ProductLabel.PROCESSED:
      return 'Embutidos';
    default:
      return 'Outro';
  }
};

export { getProductLabel };

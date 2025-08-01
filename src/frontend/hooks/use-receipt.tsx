import { useState } from 'react';

import { format } from 'date-fns';
import { Order } from 'src/constants/types';

type UseReceiptProps = {
  order: Order;
};

const useReceipt = ({ order }: UseReceiptProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadReceipt = async () => {
    setIsGeneratingPDF(true);

    try {
      const response = await fetch(`/api/v1/orders/receipt/${order.id}`, {
        method: 'GET',
        headers: {
          Accept: 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      link.download = `CHAMONE-FRIOS-${format(new Date(order.created_at), 'dd-MM-yyyy')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar recibo:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return {
    isGeneratingPDF,
    handleDownloadReceipt,
  };
};

export { useReceipt };

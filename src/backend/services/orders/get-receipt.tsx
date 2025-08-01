import { renderToBuffer } from '@react-pdf/renderer';
import { NextApiResponse } from 'next';

import { format } from 'date-fns';
import { getOrder } from 'src/backend/database';

import { Receipt } from './receipt';

const getReceipt = async (orderId: string, res: NextApiResponse) => {
  try {
    if (!orderId || orderId.length < 8) {
      return res.status(400).json({
        error: 'Invalid order ID',
        message: 'ID do pedido inválido',
      });
    }

    const order = await getOrder({ id: orderId });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Pedido não encontrado',
      });
    }

    const pdfBuffer = await renderToBuffer(<Receipt order={order} />);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="CHAMONE-FRIOS-${format(new Date(order.created_at), 'dd-MM-yyyy')}.pdf"`
    );
    res.setHeader('Content-Length', pdfBuffer.length.toString());

    res.end(pdfBuffer);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Erro interno do servidor',
    });
  }
};

export { getReceipt };

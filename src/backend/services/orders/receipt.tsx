import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { OrderWithItems } from 'src/constants/types';
import { getMetricLabel, numberToCurrency } from 'src/utils';
import { formatNumber } from 'src/utils/number';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 12,
    fontSize: 10,
    lineHeight: 1.3,
  },
  header: {
    marginBottom: 10,
    borderBottom: '2px solid #002820',
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#002820',
    textAlign: 'center',
    marginBottom: 4,
  },
  orderInfo: {
    textAlign: 'center',
    fontSize: 12,
    color: '#333333',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
    paddingBottom: 5,
    borderBottom: '1px dashed #e0e0e0',
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 1,
    alignItems: 'flex-start',
  },
  fieldLabel: {
    fontSize: 10,
    color: '#666666',
    width: '35%',
    fontWeight: 'bold',
  },
  fieldValue: {
    fontSize: 10,
    color: '#333333',
    width: '65%',
    flexWrap: 'wrap',
  },
  productCard: {
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
    backgroundColor: '#fafafa',
  },
  productName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  summarySection: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    border: '1px solid #e0e0e0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 10,
    color: '#333333',
    fontWeight: 'bold',
  },
  discountValue: {
    color: '#136618',
    fontSize: 10,
    fontWeight: 'bold',
  },
  taxValue: {
    color: '#830210',
    fontSize: 10,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    paddingTop: 4,
    borderTop: '1px solid #cccccc',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#002820',
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#002820',
  },
  footer: {
    marginTop: 8,
    fontSize: 8,
    color: '#999999',
    textAlign: 'center',
  },
});

const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Aguardando pagamento',
    paid: 'Pago',
    cancelled: 'Cancelado',
  };
  return statusMap[status] || status.toUpperCase();
};

type ReceiptProps = {
  order: OrderWithItems;
};

const Receipt = ({ order }: ReceiptProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>RECIBO DE COMPRA</Text>
        <Text style={styles.orderInfo}>Chamone Frios</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações do cliente:</Text>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Nome do cliente:</Text>
          <Text style={styles.fieldValue}>{order.client_name}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Contato:</Text>
          <Text style={styles.fieldValue}>
            {order.client_phone ? order.client_phone : 'Não informado'}
          </Text>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações do pedido:</Text>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Status:</Text>
          <View style={styles.fieldValue}>
            <Text>{getStatusLabel(order.status)}</Text>
          </View>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Horário:</Text>
          <Text style={styles.fieldValue}>
            {format(new Date(order.created_at), 'HH:mm', { locale: ptBR })}
          </Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Data:</Text>
          <Text style={styles.fieldValue}>
            {format(new Date(order.created_at), 'dd/MM/yyyy, eeee', {
              locale: ptBR,
            })}
          </Text>
        </View>
        {order.tax > 0 && (
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Taxas adicionais:</Text>
            <Text style={styles.fieldValue}>
              {numberToCurrency({ number: order.tax })}
            </Text>
          </View>
        )}
        {order.discount > 0 && (
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Descontos:</Text>
            <Text style={styles.fieldValue}>
              {numberToCurrency({ number: order.discount })}
            </Text>
          </View>
        )}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Valor total:</Text>
          <Text
            style={[
              styles.fieldValue,
              { fontWeight: 'bold', color: '#002820' },
            ]}
          >
            {numberToCurrency({ number: order.total })}
          </Text>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Produtos comprados:</Text>
        {order.items.length > 0 ? (
          order.items.map((item) => (
            <View key={item.id} style={styles.productCard}>
              <Text style={styles.productName}>{item.product_name}</Text>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Quantidade:</Text>
                <Text style={styles.fieldValue}>
                  {`${formatNumber({ number: item.quantity })} ${getMetricLabel(item.product_metric)}`}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Preço por unidade:</Text>
                <Text style={styles.fieldValue}>
                  {numberToCurrency({ number: item.unit_price })}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Preço total:</Text>
                <Text style={[styles.fieldValue, { fontWeight: 'bold' }]}>
                  {numberToCurrency({ number: item.subtotal })}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.fieldValue}>Nenhum produto adicionado.</Text>
        )}
      </View>
      <View style={styles.summarySection}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal:</Text>
          <Text style={styles.summaryValue}>
            {numberToCurrency({ number: order.subtotal })}
          </Text>
        </View>
        {order.discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Desconto:</Text>
            <Text style={styles.discountValue}>
              {numberToCurrency({ number: order.discount })}
            </Text>
          </View>
        )}
        {order.tax > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxa:</Text>
            <Text style={styles.taxValue}>
              {numberToCurrency({ number: order.tax })}
            </Text>
          </View>
        )}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>VALOR TOTAL:</Text>
          <Text style={styles.totalValue}>
            {numberToCurrency({ number: order.total })}
          </Text>
        </View>
      </View>
      <Text style={styles.footer}>
        Esse recibo não possui validade fiscal e é apenas um comprovante de
        compra.
      </Text>
    </Page>
  </Document>
);

export { Receipt };

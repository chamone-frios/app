export enum ProductMetric {
  UNIT = 0,
  KG = 1,
  G = 2,
  L = 3,
}

export type Product = {
  id: string;
  name: string;
  img: string;
  description: string;
  maker: string;
  metric: ProductMetric;
  stock: number;
  price: number;
};

export type GetProductsResponse = {
  products: Product[];
};

export type GetProductResponse = {
  product: Product;
};

export type Client = {
  id: string;
  name: string;
  establishment_type: string;
  phone: string;
  maps_link?: string;
};

export type GetClientsResponse = {
  clients: Client[];
};

export type GetClientResponse = {
  client: Client;
};

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export type OrderItem = {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  product_description: string;
  product_maker: string;
  product_metric: ProductMetric;
  product_img?: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
};

export type Order = {
  id: string;
  client_id?: string;
  client_name: string;
  client_establishment_type: string;
  client_phone: string;
  status: OrderStatus;
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  notes?: string;
  created_at: string;
};

export type OrderWithItems = Order & {
  items: OrderItem[];
};

export type GetOrdersResponse = {
  orders: Order[];
};

export type GetOrderResponse = {
  order: OrderWithItems;
};

export type GetOrderItemsResponse = {
  items: OrderItem[];
};

export type CreateOrderItem = {
  product_id: string;
  quantity: number;
};

export type CreateOrderRequest = {
  client_id: string;
  items: CreateOrderItem[];
  discount?: number;
  tax?: number;
  notes?: string;
};

export type CreateOrderResponse = {
  order: OrderWithItems;
};

export type UpdateOrderRequest = {
  status?: OrderStatus;
  discount?: number;
  tax?: number;
  notes?: string;
};

export type UpdateOrderResponse = {
  order: OrderWithItems;
};

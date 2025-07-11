/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createType('order_status', ['pending', 'paid', 'cancelled']);

  pgm.createTable('orders', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    client_id: {
      type: 'uuid',
      notNull: false,
      references: 'clients(id)',
      onDelete: 'SET NULL',
    },
    client_name: {
      type: 'varchar(150)',
      notNull: true,
    },
    client_establishment_type: {
      type: 'varchar(100)',
      notNull: true,
    },
    client_phone: {
      type: 'varchar(20)',
      notNull: true,
    },
    status: {
      type: 'order_status',
      notNull: true,
      default: 'pending',
    },
    subtotal: {
      type: 'numeric(10,2)',
      notNull: true,
    },
    discount: {
      type: 'numeric(10,2)',
      notNull: false,
      default: 0,
    },
    tax: {
      type: 'numeric(10,2)',
      notNull: false,
      default: 0,
    },
    total: {
      type: 'numeric(10,2)',
      notNull: true,
    },
    notes: {
      type: 'text',
      notNull: false,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createTable('order_items', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    order_id: {
      type: 'uuid',
      notNull: true,
      references: 'orders(id)',
      onDelete: 'CASCADE',
    },
    product_id: {
      type: 'uuid',
      notNull: false,
      references: 'products(id)',
      onDelete: 'SET NULL',
    },
    product_name: {
      type: 'varchar(100)',
      notNull: true,
    },
    product_description: {
      type: 'text',
      notNull: true,
    },
    product_maker: {
      type: 'varchar(100)',
      notNull: true,
    },
    product_metric: {
      type: 'product_metric',
      notNull: true,
    },
    product_img: {
      type: 'varchar(255)',
      notNull: false,
    },
    unit_price: {
      type: 'numeric(10,2)',
      notNull: true,
    },
    quantity: {
      type: 'numeric(10,2)',
      notNull: true,
    },
    subtotal: {
      type: 'numeric(10,2)',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('orders', 'client_id');
  pgm.createIndex('orders', 'status');
  pgm.createIndex('orders', 'created_at');
  pgm.createIndex('order_items', 'order_id');
  pgm.createIndex('order_items', 'product_id');
};

exports.down = (pgm) => {
  pgm.dropTable('order_items');
  pgm.dropTable('orders');
  pgm.dropType('order_status');
};

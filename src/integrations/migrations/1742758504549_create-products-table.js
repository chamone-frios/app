/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createType('product_metric', ['unit', 'kg', 'g', 'l']);

  pgm.createTable('products', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    name: { type: 'varchar(100)', notNull: true },
    img: { type: 'varchar(255)', notNull: false },
    description: { type: 'text', notNull: true },
    maker: { type: 'varchar(100)', notNull: true },
    metric: { type: 'product_metric', notNull: true },
    stock: { type: 'integer', notNull: true },
    price: { type: 'numeric(10,2)', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('products');
  pgm.dropType('product_metric');
};

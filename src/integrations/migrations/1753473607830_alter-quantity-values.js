/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.alterColumn('products', 'stock', {
    type: 'numeric(10,3)',
    notNull: true,
  });

  pgm.alterColumn('order_items', 'quantity', {
    type: 'numeric(10,3)',
    notNull: true,
  });
};

exports.down = (pgm) => {
  pgm.alterColumn('order_items', 'quantity', {
    type: 'numeric(10,2)',
    notNull: true,
  });

  pgm.alterColumn('products', 'stock', {
    type: 'integer',
    notNull: true,
  });
};

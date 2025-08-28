/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn('products', {
    label: {
      type: 'integer',
      notNull: false,
      comment: 'Product label/category as integer (0=CHEESE, 1=MEAT, 2=HAMBURGER, etc)',
    },
  });
  pgm.addColumn('order_items', {
    product_label: {
      type: 'integer',
      notNull: false,
      comment: 'Product label/category at the time of order creation (0=DAIRY, 1=MEATS, 2=HAMBURGERS, etc)',
    },
  });

  pgm.createIndex('order_items', 'product_label');
  pgm.createIndex('products', 'label');
};

exports.down = (pgm) => {
  pgm.dropIndex('products', 'label');
  pgm.dropColumn('products', 'label');
  pgm.dropIndex('order_items', 'product_label');
  pgm.dropColumn('order_items', 'product_label');
};

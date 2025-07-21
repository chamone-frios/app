/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.alterColumn('products', 'stock', {
    type: 'numeric(10,2)',
    notNull: true,
  });

  pgm.addColumns('products', {
    purchase_price: {
      type: 'numeric(10,2)',
      notNull: false,
      comment: 'Preço de compra do produto',
    },
    profit_margin: {
      type: 'numeric(10,2)',
      notNull: false,
      comment: 'Margem de lucro por unidade (price - purchase_price)',
    },
  });

  pgm.addColumns('order_items', {
    unit_purchase_price: {
      type: 'numeric(10,2)',
      notNull: false,
      comment: 'Preço de compra unitário no momento do pedido',
    },
    unit_profit: {
      type: 'numeric(10,2)',
      notNull: false,
      comment: 'Lucro unitário no momento do pedido',
    },
    total_profit: {
      type: 'numeric(10,2)',
      notNull: false,
      comment: 'Lucro total do item (unit_profit * quantity)',
    },
  });


  pgm.addColumns('orders', {
    total_purchase_cost: {
      type: 'numeric(10,2)',
      notNull: false,
      comment: 'Custo total de compra de todos os itens do pedido',
    },
    total_profit: {
      type: 'numeric(10,2)',
      notNull: false,
      comment: 'Lucro total do pedido (total - total_purchase_cost)',
    },
    profit_margin_percentage: {
      type: 'numeric(5,2)',
      notNull: false,
      comment: 'Percentual de margem de lucro do pedido',
    },
  });

  pgm.createIndex('products', 'purchase_price');
  pgm.createIndex('products', 'profit_margin');
  pgm.createIndex('orders', 'total_profit');
  pgm.createIndex('orders', 'profit_margin_percentage');
  pgm.createIndex('order_items', 'unit_profit');

  pgm.sql(`
    UPDATE products
    SET profit_margin = CASE
      WHEN purchase_price IS NOT NULL THEN price - purchase_price
      ELSE NULL
    END
    WHERE purchase_price IS NOT NULL;
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_product_profit_margin()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.purchase_price IS NOT NULL AND NEW.price IS NOT NULL THEN
        NEW.profit_margin = NEW.price - NEW.purchase_price;
      ELSE
        NEW.profit_margin = NULL;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  pgm.sql(`
    CREATE TRIGGER trigger_update_product_profit_margin
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_product_profit_margin();
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TRIGGER IF EXISTS trigger_update_product_profit_margin ON products;');
  pgm.sql('DROP FUNCTION IF EXISTS update_product_profit_margin();');

  pgm.dropIndex('order_items', 'unit_profit');
  pgm.dropIndex('orders', 'profit_margin_percentage');
  pgm.dropIndex('orders', 'total_profit');
  pgm.dropIndex('products', 'profit_margin');
  pgm.dropIndex('products', 'purchase_price');

  pgm.dropColumns('orders', ['total_purchase_cost', 'total_profit', 'profit_margin_percentage']);
  pgm.dropColumns('order_items', ['unit_purchase_price', 'unit_profit', 'total_profit']);
  pgm.dropColumns('products', ['purchase_price', 'profit_margin']);

  pgm.alterColumn('products', 'stock', {
    type: 'integer',
    notNull: true,
  });
};

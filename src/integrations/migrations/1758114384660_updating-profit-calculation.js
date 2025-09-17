/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // Update existing orders to recalculate profit considering discount and tax
  pgm.sql(`
    UPDATE orders
    SET
      total_profit = (subtotal - discount + tax) - total_purchase_cost,
      profit_margin_percentage = CASE
        WHEN (subtotal - discount + tax) > 0
        THEN (((subtotal - discount + tax) - total_purchase_cost) / (subtotal - discount + tax)) * 100
        ELSE 0
      END
    WHERE total_purchase_cost IS NOT NULL;
  `);
};

exports.down = (pgm) => {
  // Revert to old calculation (item profits sum)
  pgm.sql(`
    UPDATE orders
    SET
      total_profit = (
        SELECT COALESCE(SUM(oi.total_profit), 0)
        FROM order_items oi
        WHERE oi.order_id = orders.id
      ),
      profit_margin_percentage = CASE
        WHEN subtotal > 0
        THEN ((
          SELECT COALESCE(SUM(oi.total_profit), 0)
          FROM order_items oi
          WHERE oi.order_id = orders.id
        ) / subtotal) * 100
        ELSE 0
      END
    WHERE total_purchase_cost IS NOT NULL;
  `);
};

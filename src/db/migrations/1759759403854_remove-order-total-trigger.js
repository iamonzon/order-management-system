/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * Remove the verify_order_total trigger that incorrectly validates
 * order totals BEFORE order_items are inserted.
 *
 * Order total validation is handled in the application layer
 * (OrderRepository.createOrder) where we have full control over
 * the transaction and can calculate totals after fetching product prices.
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.dropTrigger('orders', 'verify_total_trigger', { ifExists: true });
  pgm.dropFunction('verify_order_total', [], { ifExists: true });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.createFunction(
    'verify_order_total',
    [],
    { returns: 'trigger', language: 'plpgsql' },
    `
    DECLARE
      calculated_total decimal(10,2);
    BEGIN
      SELECT COALESCE(SUM(quantity * price_at_purchase), 0)
      INTO calculated_total
      FROM order_items
      WHERE order_id = NEW.id;

      IF ABS(calculated_total - NEW.total_amount) > 0.01 THEN
        RAISE EXCEPTION 'Order total % does not match sum of items %',
          NEW.total_amount, calculated_total;
      END IF;

      RETURN NEW;
    END;
    `
  );

  pgm.createTrigger('orders', 'verify_total_trigger', {
    when: 'BEFORE',
    operation: ['INSERT', 'UPDATE'],
    function: 'verify_order_total',
    level: 'ROW'
  });
};

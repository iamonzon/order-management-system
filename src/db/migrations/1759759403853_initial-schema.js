/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable('products', {
    id: 'id',
    name: { type: 'varchar(255)', notNull: true, unique: true },
    price: { type: 'decimal(10,2)', notNull: true },
    stock_quantity: { type: 'integer', notNull: true, default: 0 },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') }
  });

  pgm.addConstraint('products', 'products_price_positive', 
    'CHECK (price >= 0)');
  pgm.addConstraint('products', 'products_stock_non_negative', 
    'CHECK (stock_quantity >= 0)');

  pgm.createTable('customers', {
    id: 'id',
    email: { type: 'varchar(255)', notNull: true, unique: true },
    name: { type: 'varchar(255)', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') }
  });

  pgm.createTable('orders', {
    id: 'id',
    customer_id: {
      type: 'integer',
      notNull: true,
      references: 'customers',
      onDelete: 'RESTRICT'
    },
    status: { type: 'varchar(50)', notNull: true },
    total_amount: { type: 'decimal(10,2)', notNull: true },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.addConstraint('orders', 'orders_status_valid',
    "CHECK (status IN ('pending', 'processing', 'completed', 'cancelled'))");
  
  pgm.addConstraint('orders', 'orders_total_positive',
    'CHECK (total_amount > 0)');

  pgm.createTable('order_items', {
    id: 'id',
    order_id: {
      type: 'integer',
      notNull: true,
      references: 'orders',
      onDelete: 'CASCADE'
    },
    product_id: {
      type: 'integer',
      notNull: true,
      references: 'products',
      onDelete: 'RESTRICT'
    },
    quantity: { type: 'integer', notNull: true },
    price_at_purchase: { type: 'decimal(10,2)', notNull: true }
  });
  pgm.addConstraint('order_items', 'order_items_quantity_positive',
    'CHECK (quantity > 0)');
  pgm.addConstraint('order_items', 'order_items_price_positive',
    'CHECK (price_at_purchase >= 0)');

  pgm.createIndex('orders', 'customer_id');
  pgm.createIndex('order_items', 'order_id');
  pgm.createIndex('order_items', 'product_id');

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

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('order_items');
  pgm.dropTable('orders');
  pgm.dropTable('customers');
};

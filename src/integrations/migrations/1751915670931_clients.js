/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('clients', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    name: {
      type: 'varchar(150)',
      notNull: true
    },
    establishment_type: {
      type: 'varchar(100)',
      notNull: true
    },
    phone: {
      type: 'varchar(20)',
      notNull: true
    },
    maps_link: {
      type: 'text',
      notNull: false
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('clients', 'name');
};

exports.down = (pgm) => {
  pgm.dropTable('clients');
};

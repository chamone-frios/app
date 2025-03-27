import { query } from 'infra/db';

export const clearDatabase = async () => {
  await query('DROP SCHEMA public CASCADE;');
  await query('CREATE SCHEMA public;');
};

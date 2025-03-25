import { query } from "infra/database";

export const clearDatabase = async () => {
  await query("DROP SCHEMA public CASCADE;");
  await query("CREATE SCHEMA public;");
};

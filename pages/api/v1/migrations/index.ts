import { join } from 'node:path';

import { getClient } from 'infra/database';
import { NextApiRequest, NextApiResponse } from 'next';
import node_pg_migration from 'node-pg-migrate';

const migrations = async (req: NextApiRequest, res: NextApiResponse) => {
  const alowedMethods = ['GET', 'POST'];
  if (!alowedMethods.includes(req.method)) {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  console.log('Getting client...');
  const dbClient = await getClient();
  console.log('Client connected, executing query...');
  const dryRun = req.method === 'GET';

  try {
    const migrations = await node_pg_migration({
      dbClient,
      migrationsTable: 'pgmigrations',
      dir: join('infra', 'migrations'),
      direction: 'up',
      dryRun,
      verbose: true,
    });

    if (migrations.length > 0) return res.status(201).json(migrations);

    res.status(200).json(migrations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
    throw error;
  } finally {
    await dbClient.end();
  }
};

export default migrations;

import { getApiEndpoint } from './get-api-endpoint';

export const runMigrations = async (): Promise<void> => {
  const apiUrl = getApiEndpoint();
  try {
    const migrationsResponse = await fetch(`${apiUrl}/api/v1/migrations`, {
      method: 'POST',
    });

    if (
      migrationsResponse.status !== 201 &&
      migrationsResponse.status !== 200
    ) {
      const body = await migrationsResponse.text();
      throw new Error(
        `Failed to run migrations: ${migrationsResponse.status} ${body}`
      );
    }
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
};

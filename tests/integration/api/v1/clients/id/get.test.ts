import { Client } from 'src/constants/types';
import { waitForAllServices } from 'tests/orchestrator';

describe('GET /api/v1/clients/[id]', () => {
  let createdClientId: string;

  beforeAll(async () => {
    await waitForAllServices();

    const clientToCreate: Omit<Client, 'id'> = {
      name: 'Test Client Get By ID',
      establishment_type: 'Restaurant',
      phone: '+1234567890',
      maps_link: 'https://maps.google.com/test-client',
    };

    const createResponse = await fetch('http://localhost:3000/api/v1/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientToCreate),
    });

    const createData = await createResponse.json();
    createdClientId = createData.id;
  });

  it("should return 404 when client doesn't exist", async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const response = await fetch(
      `http://localhost:3000/api/v1/clients/${nonExistentId}`
    );

    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Client not found');
  });

  it('should return the specific client when a valid ID is provided', async () => {
    const response = await fetch(
      `http://localhost:3000/api/v1/clients/${createdClientId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('client');
    expect(data.client).toHaveProperty('id');
    expect(data.client.id).toBe(createdClientId);
  });

  it('should return the correct client structure', async () => {
    const response = await fetch(
      `http://localhost:3000/api/v1/clients/${createdClientId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    const client = data.client;

    expect(client).toHaveProperty('id');
    expect(client).toHaveProperty('name');
    expect(client).toHaveProperty('establishment_type');
    expect(client).toHaveProperty('phone');
    expect(client).toHaveProperty('maps_link');

    expect(typeof client.id).toBe('string');
    expect(typeof client.name).toBe('string');
    expect(typeof client.establishment_type).toBe('string');
    expect(typeof client.phone === 'string' || client.phone === null).toBe(
      true
    );
    expect(
      typeof client.maps_link === 'string' || client.maps_link === null
    ).toBe(true);
  });

  it('should return correct data for the created client', async () => {
    const response = await fetch(
      `http://localhost:3000/api/v1/clients/${createdClientId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    const client = data.client;

    expect(client.name).toBe('Test Client Get By ID');
    expect(client.establishment_type).toBe('Restaurant');
    expect(client.phone).toBe('+1234567890');
    expect(client.maps_link).toBe('https://maps.google.com/test-client');
  });

  it('should handle client with minimal data', async () => {
    const minimalClient: Omit<Client, 'id'> = {
      name: 'Minimal Client',
      establishment_type: 'Store',
      phone: '12345',
    };

    const createResponse = await fetch('http://localhost:3000/api/v1/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(minimalClient),
    });

    const createData = await createResponse.json();
    const minimalClientId = createData.id;

    const response = await fetch(
      `http://localhost:3000/api/v1/clients/${minimalClientId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    const client = data.client;

    expect(client.name).toBe('Minimal Client');
    expect(client.establishment_type).toBe('Store');
    expect(client.phone).toBe('12345');
    expect(client.maps_link).toBeNull();
  });

  it('should handle method not allowed', async () => {
    const response = await fetch(
      `http://localhost:3000/api/v1/clients/${createdClientId}`,
      { method: 'PUT' }
    );

    expect(response.status).toBe(405);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Method not allowed');
  });

  it('should handle invalid UUID format', async () => {
    const invalidId = 'invalid-uuid';
    const response = await fetch(
      `http://localhost:3000/api/v1/clients/${invalidId}`
    );

    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data).toHaveProperty('error');
  });
});

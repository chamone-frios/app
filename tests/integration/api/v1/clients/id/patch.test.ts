import { Client } from 'src/constants/types';
import { waitForAllServices } from 'tests/orchestrator';
import { getApiEndpoint } from 'tests/utils';

describe('PATCH /api/v1/clients/[id]', () => {
  let createdClientId: string;
  const apiUrl = getApiEndpoint();

  const updatedClient: Omit<Client, 'id'> = {
    name: 'Updated Test Client',
    establishment_type: 'Updated Restaurant',
    phone: '+9876543210',
    maps_link: 'https://maps.google.com/updated-client',
  };

  beforeEach(async () => {
    await waitForAllServices();

    const clientToCreate: Omit<Client, 'id'> = {
      name: 'Test Client for PATCH',
      establishment_type: 'Restaurant',
      phone: '+1234567890',
      maps_link: 'https://maps.google.com/test-client',
    };

    const createResponse = await fetch(`${apiUrl}/api/v1/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientToCreate),
    });

    const createData = await createResponse.json();
    createdClientId = createData.id;
  });

  it("should return 500 when client doesn't exist", async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const response = await fetch(`${apiUrl}/api/v1/clients/${nonExistentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedClient),
    });

    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('should return 400 when client data is invalid', async () => {
    const invalidClient = {
      name: '',
      establishment_type: '',
      phone: 123,
      maps_link: 456,
    };

    const response = await fetch(
      `${apiUrl}/api/v1/clients/${createdClientId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidClient),
      }
    );

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Invalid data');
    expect(data).toHaveProperty('details');
    expect(Array.isArray(data.details)).toBe(true);
    expect(data.details.length).toBeGreaterThan(0);
  });

  it('should successfully update a client with valid data', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/clients/${createdClientId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedClient),
      }
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data.id).toBe(createdClientId);
  });

  it('should confirm the client was actually updated', async () => {
    await fetch(`${apiUrl}/api/v1/clients/${createdClientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedClient),
    });

    const response = await fetch(`${apiUrl}/api/v1/clients/${createdClientId}`);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('client');

    const client = data.client;
    expect(client.name).toBe('Updated Test Client');
    expect(client.establishment_type).toBe('Updated Restaurant');
    expect(client.phone).toBe('+9876543210');
    expect(client.maps_link).toBe('https://maps.google.com/updated-client');
  });

  it('should successfully update a client with only required fields', async () => {
    const minimalUpdate: Omit<Client, 'id'> = {
      name: 'Minimal Updated Client',
      establishment_type: 'Cafe',
      phone: '12345',
    };

    const response = await fetch(
      `${apiUrl}/api/v1/clients/${createdClientId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(minimalUpdate),
      }
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data.id).toBe(createdClientId);
  });

  it('should trigger error when trying to update a client with missing required fields', async () => {
    const partialUpdate = {
      name: 'Partially Updated Client',
    };

    const updateResponse = await fetch(
      `${apiUrl}/api/v1/clients/${createdClientId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partialUpdate),
      }
    );

    expect(updateResponse.status).toBe(400);

    const errorData = await updateResponse.json();
    expect(errorData).toHaveProperty('error');
    expect(errorData.error).toBe('Invalid data');
  });

  it('should handle updating optional fields to null/undefined', async () => {
    const clientWithoutOptionals: Omit<Client, 'id'> = {
      name: 'Client Without Optionals',
      establishment_type: 'Store',
      phone: '12345',
      maps_link: undefined,
    };

    const response = await fetch(
      `${apiUrl}/api/v1/clients/${createdClientId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientWithoutOptionals),
      }
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data.id).toBe(createdClientId);
  });

  it('should handle method not allowed', async () => {
    const response = await fetch(
      `${apiUrl}/api/v1/clients/${createdClientId}`,
      { method: 'PUT' }
    );

    expect(response.status).toBe(405);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Method not allowed');
  });
});

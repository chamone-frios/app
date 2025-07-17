import { Client } from 'src/constants/types';
import { waitForAllServices } from 'tests/orchestrator';
import { getApiEndpoint } from 'tests/utils';

describe('GET /api/v1/clients', () => {
  const apiUrl = getApiEndpoint();

  beforeAll(async () => {
    await waitForAllServices();
  });

  it('should return an empty array when no clients exist', async () => {
    const response = await fetch(`${apiUrl}/api/v1/clients`);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('clients');
    expect(Array.isArray(data.clients)).toBe(true);
    expect(data.clients.length).toBe(0);
  });

  it('should return all clients when clients exist', async () => {
    const clientsToCreate: Omit<Client, 'id'>[] = [
      {
        name: 'Test Restaurant',
        establishment_type: 'Restaurant',
        phone: '+1234567890',
        maps_link: 'https://maps.google.com/test-restaurant',
      },
      {
        name: 'Test Cafe',
        establishment_type: 'Cafe',
        phone: '+0987654321',
        maps_link: 'https://maps.google.com/test-cafe',
      },
      {
        name: 'Test Bar',
        establishment_type: 'Bar',
        phone: '+1122334455',
        maps_link: 'https://maps.google.com/test-bar',
      },
    ];

    const createdClientIds = [];

    for (const client of clientsToCreate) {
      const createResponse = await fetch(`${apiUrl}/api/v1/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(client),
      });

      expect(createResponse.status).toBe(201);

      const createData = await createResponse.json();
      expect(createData.success).toBe(true);
      expect(createData.id).toBeDefined();

      createdClientIds.push(createData.id);
    }

    const response = await fetch(`${apiUrl}/api/v1/clients`);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('clients');
    expect(Array.isArray(data.clients)).toBe(true);
    expect(data.clients.length).toBeGreaterThanOrEqual(clientsToCreate.length);

    for (let i = 0; i < createdClientIds.length; i++) {
      const foundClient = data.clients.find(
        (c) => c.id === createdClientIds[i]
      );
      expect(foundClient).toBeDefined();
      expect(foundClient.name).toBe(clientsToCreate[i].name);
      expect(foundClient.establishment_type).toBe(
        clientsToCreate[i].establishment_type
      );
      expect(foundClient.phone).toBe(clientsToCreate[i].phone);
      expect(foundClient.maps_link).toBe(clientsToCreate[i].maps_link);
    }
  });

  it('should return the correct client structure', async () => {
    const response = await fetch(`${apiUrl}/api/v1/clients`);

    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data.clients.length).toBeGreaterThan(0);

    const client = data.clients[0];

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

  it('should handle clients with minimal data', async () => {
    const minimalClient = {
      name: 'Minimal Client',
      establishment_type: 'Store',
      phone: '12345',
    };

    const createResponse = await fetch(`${apiUrl}/api/v1/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(minimalClient),
    });

    expect(createResponse.status).toBe(201);

    const response = await fetch(`${apiUrl}/api/v1/clients`);

    expect(response.status).toBe(200);

    const data = await response.json();
    const foundClient = data.clients.find((c) => c.name === minimalClient.name);

    expect(foundClient).toBeDefined();
    expect(foundClient.name).toBe(minimalClient.name);
    expect(foundClient.establishment_type).toBe(
      minimalClient.establishment_type
    );
    expect(foundClient.phone).toBe(minimalClient.phone);
  });

  it('should handle method not allowed', async () => {
    const response = await fetch(`${apiUrl}/api/v1/clients`, {
      method: 'PUT',
    });

    expect(response.status).toBe(405);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Method not allowed');
  });
});

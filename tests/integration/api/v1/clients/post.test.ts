import { Client } from 'src/constants/types';
import { waitForAllServices } from 'tests/orchestrator';

describe('POST /api/v1/clients', () => {
  beforeAll(async () => {
    await waitForAllServices();
  });

  it('should create a new client when all required fields are valid', async () => {
    const clientData: Omit<Client, 'id'> = {
      name: 'Test Restaurant',
      establishment_type: 'Restaurant',
      phone: '+1234567890',
      maps_link: 'https://maps.google.com/test-restaurant',
    };

    const response = await fetch('http://localhost:3000/api/v1/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });

    expect(response.status).toBe(201);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.id).toBeDefined();

    const getResponse = await fetch(`http://localhost:3000/api/v1/clients`);
    const clients = await getResponse.json();

    expect(getResponse.status).toBe(200);
    expect(Array.isArray(clients.clients)).toBeTruthy();

    const createdClient = clients.clients.find((c) => c.id === responseData.id);
    expect(createdClient).toBeDefined();
    expect(createdClient.name).toBe(clientData.name);
    expect(createdClient.establishment_type).toBe(
      clientData.establishment_type
    );
    expect(createdClient.phone).toBe(clientData.phone);
    expect(createdClient.maps_link).toBe(clientData.maps_link);
  });

  it('should create a new client with only required fields', async () => {
    const clientData = {
      name: 'Minimal Client',
      establishment_type: 'Cafe',
      phone: '12345',
    };

    const response = await fetch('http://localhost:3000/api/v1/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });

    expect(response.status).toBe(201);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.id).toBeDefined();
  });

  it('should return 400 when required fields are missing', async () => {
    const incompleteData = {
      name: 'Incomplete Client',
    };

    const response = await fetch('http://localhost:3000/api/v1/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incompleteData),
    });

    expect(response.status).toBe(400);

    const responseData = await response.json();
    expect(responseData.error).toBe('Missing required fields');
  });

  it('should return 400 when name is missing', async () => {
    const missingNameData = {
      establishment_type: 'Restaurant',
    };

    const response = await fetch('http://localhost:3000/api/v1/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(missingNameData),
    });

    expect(response.status).toBe(400);

    const responseData = await response.json();
    expect(responseData.error).toBe('Missing required fields');
  });

  it('should return 400 when establishment_type is missing', async () => {
    const missingEstablishmentData = {
      name: 'Test Client',
    };

    const response = await fetch('http://localhost:3000/api/v1/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(missingEstablishmentData),
    });

    expect(response.status).toBe(400);

    const responseData = await response.json();
    expect(responseData.error).toBe('Missing required fields');
  });

  it('should accept various establishment types', async () => {
    const establishmentTypes = ['Restaurant', 'Cafe', 'Bar', 'Hotel', 'Store'];

    for (const establishmentType of establishmentTypes) {
      const clientData = {
        name: `Test ${establishmentType}`,
        establishment_type: establishmentType,
        phone: '+1234567890',
        maps_link: `https://maps.google.com/test-${establishmentType.toLowerCase()}`,
      };

      const response = await fetch('http://localhost:3000/api/v1/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      expect(response.status).toBe(201);

      const responseData = await response.json();
      expect(responseData.success).toBe(true);
      expect(responseData.id).toBeDefined();
    }
  });

  it('should return 405 for non-POST methods', async () => {
    const response = await fetch('http://localhost:3000/api/v1/clients', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: 'data' }),
    });

    expect(response.status).toBe(405);

    const responseData = await response.json();
    expect(responseData.error).toBe('Method not allowed');
  });
});

import { NextApiRequest, NextApiResponse } from 'next';

import { updateClient } from 'src/backend/database';

const updateClientById = async (
  id: string,
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const client = req.body;

    if (!client) return res.status(400).json({ error: 'Client not received' });

    const validationErrors = [];

    if (!client.name || typeof client.name !== 'string')
      validationErrors.push('Name must be a text');

    if (
      !client.establishment_type ||
      typeof client.establishment_type !== 'string'
    )
      validationErrors.push('Establishment type must be a text');

    if (client.phone && typeof client.phone !== 'string')
      validationErrors.push('Phone must be a text');

    if (client.maps_link && typeof client.maps_link !== 'string')
      validationErrors.push('Maps link must be a text');

    if (validationErrors.length > 0)
      return res.status(400).json({
        error: 'Invalid data',
        details: validationErrors,
      });

    const updatedClientId = await updateClient({
      id,
      client: {
        name: client.name,
        establishment_type: client.establishment_type,
        phone: client.phone,
        maps_link: client.maps_link,
      },
    });

    return res.status(200).json({ id: updatedClientId });
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Failed to update client', details: error });
  }
};

export { updateClientById };

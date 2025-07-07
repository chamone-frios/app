import { NextApiRequest, NextApiResponse } from 'next';

import { insertClient } from 'src/backend/database';

const createClient = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const body = req.body;
    if (!body.name || !body.establishment_type) {
      return res.status(400).json({
        error: 'Missing required fields',
      });
    }

    const clientId = await insertClient({
      name: body.name,
      establishment_type: body.establishment_type,
      phone: body.phone,
      maps_link: body.maps_link,
    });

    return res.status(201).json({
      success: true,
      id: clientId,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'An error occurred while creating the client',
      details: error,
    });
  }
};

export { createClient };

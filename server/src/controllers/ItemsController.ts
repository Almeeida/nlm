import { Request, Response } from 'express';
import knex from '../database/connection';

class ItemsController {
  async index(req: Request, res: Response) {
    const items = await knex('items').select('*');
    const serialized = items.map(({ id, image, title }) => ({
      id,
      image_url: `http://localhost:3333/uploads/${image}`,
      title,
    }));

    return res.json(serialized)
  }
}

export default ItemsController;

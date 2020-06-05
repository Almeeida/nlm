import { Request, Response } from 'express';
import knex from '../database/connection';
import { ColumnNameQueryBuilder } from 'knex';

class PointsController {
  async show(req: Request, res: Response) {
    const { id } = req.params;

    const point = await knex('points').where('id', id).first();
    if (!point) return res.status(400).json({ message: 'Point not found.' });

    const items = await knex('points')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id);

    return res.json({ point, items });
  }

  async create(req: Request, res: Response) {
    const {
      name,
      email,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = req.body;

    const trx = await knex.transaction();

    const point = {
      image: 'image-fake',
      name,
      email,
      latitude,
      longitude,
      city,
      uf,
    };

    const [point_id] = await trx('points').insert(point);

    const pointItems = items.map((item_id: Number) => ({
      item_id,
      point_id
    }))

    await trx('point_items').insert(pointItems);

    return res.json({
      id: point_id,
      ...point,
    });
  }
}

export default PointsController;

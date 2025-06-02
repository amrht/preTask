import express from 'express';
import { sql } from '../db';

const router = express.Router();

// GET /logs?limit=10
router.get('/', async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const logs = await sql`
      SELECT * FROM logs
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    res.json(logs);
  } catch (err) {
    console.error('[GET /logs] Failed to fetch logs:', err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

export default router;

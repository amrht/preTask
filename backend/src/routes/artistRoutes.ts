import express from 'express';
import { sql } from '../db';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';
import { logAction } from '../utils/logger';


const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // save files under /uploads folder (make sure this exists)
  },
  filename: function (req, file, cb) {
    // Save files with unique names, e.g., artist-<timestamp>.<ext>
    const ext = path.extname(file.originalname);
    cb(null, `artist-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// POST /artists with image upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, genre, bio } = req.body;
    let image_url = null;

    if (req.file) {
      // Store relative path or URL to the uploaded image
      image_url = `/uploads/${req.file.filename}`;
    }

    console.log(`[POST /artists] Adding artist: name="${name}", genre="${genre}", image_url=${image_url}`);

    const result = await sql`
      INSERT INTO artists (name, genre, bio, image_url)
      VALUES (${name}, ${genre}, ${bio}, ${image_url})
      RETURNING *
    `;

    console.log(`[POST /artists] Artist added with id=${result[0].id}`);
    await logAction('artists', `Artist created: ${name} (ID ${result[0].id})`);

    res.json(result[0]);
  } catch (err) {
    console.error('[POST /artists] Error adding artist:', err);
    res.status(500).json({ error: 'Failed to add artist' });
  }
});

// PUT /artists/:id with optional image upload (update artist and image)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, genre, bio } = req.body;
    let image_url = null;

    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    console.log(`[PUT /artists/${id}] Updating artist`);

    // Update artist fields conditionally including image_url if uploaded
    const result = await sql`
      UPDATE artists
      SET
        name = ${name},
        genre = ${genre},
        bio = ${bio},
        image_url = COALESCE(${image_url}, image_url)
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      res.status(404).json({ error: `Artist with id ${id} not found` });
      return;
    }

    await logAction('artists', `Artist edited: ${name} (ID ${id})`);


    console.log(`[PUT /artists/${id}] Artist updated`);
    res.json(result[0]);
  } catch (err) {
    console.error(`[PUT /artists/:id] Error updating artist id=${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to update artist' });
  }
});

/**
 * GET /artists
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const genre = (req.query.genre as string) || '';

    console.log(`[GET /artists] page=${page}, limit=${limit}, search="${search}", genre="${genre}"`);

    const offset = (page - 1) * limit;

    // Build dynamic WHERE clause safely
    let whereClause = sql``;
    if (search && genre) {
      whereClause = sql`
        WHERE (LOWER(name) LIKE ${`%${search.toLowerCase()}%`} OR LOWER(bio) LIKE ${`%${search.toLowerCase()}%`})
          AND genre = ${genre}
      `;
    } else if (search) {
      whereClause = sql`
        WHERE LOWER(name) LIKE ${`%${search.toLowerCase()}%`} OR LOWER(bio) LIKE ${`%${search.toLowerCase()}%`}
      `;
    } else if (genre) {
      whereClause = sql`
        WHERE genre = ${genre}
      `;
    }

    const totalResult = await sql`SELECT COUNT(*)::int AS count FROM artists ${whereClause}`;
    const total = totalResult[0]?.count || 0;

    const artists = await sql`
      SELECT * FROM artists
      ${whereClause}
      ORDER BY name ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

    console.log(`[GET /artists] returning ${artists.length} artists out of total ${total}`);

    res.json({ total, page, limit, artists });
  } catch (err) {
    console.error('[GET /artists] Error fetching artists:', err);
    res.status(500).json({ error: 'Failed to fetch artists' });
  }
});

/**
 * DELETE /artists/:id
 */
router.delete('/:id', async (req, res): Promise<any> => {
  try {
    const { id } = req.params;

    const [artist] = await sql`SELECT * FROM artists WHERE id = ${id}`;
    if (!artist) return res.status(404).json({ error: 'Artist not found' });

    if (artist.image_url) {
      const filePath = path.join('uploads', path.basename(artist.image_url));
      fs.unlink(filePath, () => {});
    }

    await sql`DELETE FROM artists WHERE id = ${id}`;
    await logAction('artists', `Artist deleted: ${artist.name} (ID ${artist.id})`);

    res.json({ message: `Artist ${id} deleted` });
  } catch (err) {
    console.error('[DELETE /artists/:id] Error:', err);
    res.status(500).json({ error: 'Failed to delete artist' });
  }
});

router.post(
  '/batch-delete',
  async (req: Request<{}, {}, { ids: number[] }>, res: Response): Promise<void> => {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        console.warn('[POST /artists/batch-delete] Invalid ids array');
        res.status(400).json({ error: 'ids must be a non-empty array' });
        return; // return void
      }

      console.log(`[POST /artists/batch-delete] Deleting artists with ids: ${ids.join(', ')}`);

      await sql`
        DELETE FROM artists
        WHERE id = ANY(${ids})
      `;

      await logAction(
      'artists',
      `Deleted ${ids.length} artist(s)}`
    );

      console.log(`[POST /artists/batch-delete] Deleted artists with ids: ${ids.join(', ')}`);
      res.json({ message: `Deleted artists with ids: ${ids.join(', ')}` });
    } catch (err) {
      console.error('[POST /artists/batch-delete] Error batch deleting artists:', err);
      res.status(500).json({ error: 'Failed to batch delete artists' });
    }
  }
);




export default router;

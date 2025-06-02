// Add at the top
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { sql } from '../db';
import { Request, Response } from 'express';
import { logAction } from '../utils/logger';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// GET all contents
router.get('/', async (req, res) => {
  const { search = '', type = '', page = 1, limit = 10 } = req.query as any;
  const offset = (page - 1) * limit;

  console.log(`[GET] /contents | search="${search}", type="${type}", page=${page}, limit=${limit}`);

  const contents = await sql`
    SELECT c.*, a.name AS artist_name
    FROM contents c
    LEFT JOIN artists a ON c.artist_id = a.id
    WHERE c.title ILIKE ${'%' + search + '%'} AND (${type} = '' OR c.type = ${type})
    ORDER BY c.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const total = await sql`
    SELECT COUNT(*)::int AS count
    FROM contents
    WHERE title ILIKE ${'%' + search + '%'} AND (${type} = '' OR type = ${type})
  `;

  console.log(`[GET] /contents | Returned ${contents.length} records`);

  res.json({ contents, total: total[0].count });
});

// GET content by ID
router.get('/:id', async (req: Request, res: Response): Promise<void | any> => {
  const { id } = req.params;
  console.log(`[GET] /contents/${id}`);

  const result = await sql`SELECT * FROM contents WHERE id = ${id}`;
  if (result.length === 0) {
    console.warn(`[GET] /contents/${id} | Not found`);
    return res.status(404).json({ error: 'Not found' });
  }

  res.json(result[0]);
});

// CREATE
router.post('/', upload.single('file'), async (req, res) => {
  const { title, type, artist_id } = req.body;
  const file_url = req.file?.path.replace(/\\/g, '/');

  console.log(`[POST] /contents | title="${title}", type="${type}", artist_id=${artist_id}, file=${file_url}`);

  const result = await sql`
    INSERT INTO contents (title, type, file_url, artist_id)
    VALUES (${title}, ${type}, ${file_url}, ${artist_id})
    RETURNING *
  `;

  await logAction('contents', `Created: "${title}" by artist ${artist_id}`);

  res.json(result[0]);
});

// UPDATE
router.put('/:id', upload.single('file'), async (req, res): Promise<void | any> => {
  const { id } = req.params;
  const { title, type, artist_id } = req.body;

  const oldContent = await sql`SELECT * FROM contents WHERE id = ${id}`;
  if (oldContent.length === 0) {
    console.warn(`[PUT] /contents/${id} | Not found`);
    return res.status(404).json({ error: 'Not found' });
  }

  let file_url = oldContent[0].file_url;
  if (req.file) {
    if (file_url) fs.unlink(file_url, () => {});
    file_url = req.file.path.replace(/\\/g, '/');
  }

  console.log(`[PUT] /contents/${id} | Updating content with new values`);

  const result = await sql`
    UPDATE contents
    SET title = ${title}, type = ${type}, artist_id = ${artist_id}, file_url = ${file_url}
    WHERE id = ${id}
    RETURNING *
  `;

  await logAction('contents', `Updated ID ${id}: "${title}"`);


  res.json(result[0]);
});

// DELETE
router.delete('/:id', async (req, res): Promise<void | any> => {
  const { id } = req.params;

  const content = await sql`SELECT * FROM contents WHERE id = ${id}`;
  if (content.length === 0) {
    console.warn(`[DELETE] /contents/${id} | Not found`);
    return res.status(404).json({ error: 'Not found' });
  }

  if (content[0].file_url) fs.unlink(content[0].file_url, () => {});
  await sql`DELETE FROM contents WHERE id = ${id}`;

  console.log(`[DELETE] /contents/${id} | Deleted`);
  await logAction('contents', `Deleted ID ${id}: "${content[0].title}"`);


  res.json({ success: true });
});

// BATCH DELETE
router.post('/batch-delete', async (req, res) => {
  const { ids } = req.body as { ids: number[] };

  console.log(`[POST] /contents/batch-delete | Deleting ${ids.length} items`);

  const toDelete = await sql`
    SELECT file_url FROM contents WHERE id = ANY(${ids})
  `;
  toDelete.forEach(c => {
    if (c.file_url) fs.unlink(c.file_url, () => {});
  });

  await sql`
    DELETE FROM contents WHERE id = ANY(${ids})
  `;

  await logAction('contents', `Batch deleted IDs: ${ids.join(', ')}`);

  res.json({ success: true });
});

export default router;
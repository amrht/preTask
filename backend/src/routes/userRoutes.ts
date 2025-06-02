import { verifyGoogleToken } from '../middlewares/authMiddleware';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';
import express, { Request, Response } from 'express';
import { sql } from '../db'; 

const router = express.Router();

// 🔐 Auth route - login/signup happens in middleware
router.post('/auth', verifyGoogleToken, (req: AuthenticatedRequest, res: Response) => {
  console.log('[ROUTE] POST /auth - Authenticated user:', req.user?.email || 'Unknown');
  res.json(req.user);
});

// 👤 Protected profile route
router.get('/profile', verifyGoogleToken, (req: AuthenticatedRequest, res: Response) => {
  console.log('[ROUTE] GET /profile - Access attempt by:', req.user?.email || 'Unknown');

  if (!req.user) {
    console.warn('[ROUTE] GET /profile - Unauthorized access attempt');
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  console.log('[ROUTE] GET /profile - Returning profile for:', req.user.email);
  res.json({
    message: 'Your profile info',
    user: req.user,
  });
});

// GET all users with total count
router.get('/', async (_req: Request, res: Response) => {
  try {
    console.log('[ROUTE] GET /users - Fetching all users');
    const users = await sql`SELECT * FROM users ORDER BY id`;
    const totalResult = await sql`SELECT COUNT(*)::int AS count FROM users`;
    const total = totalResult[0]?.count ?? 0;
    console.log(`[ROUTE] GET /users - Found ${total} users`);
    res.json({ total, users });
  } catch (err) {
    console.error('[ROUTE] GET /users - Failed to fetch users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET user by ID
router.get('/:id', async (req: Request, res: Response): Promise<void | any> => {
  const id = Number(req.params.id);
  try {
    console.log(`[ROUTE] GET /users/${id} - Fetching user`);
    const [user] = await sql`SELECT * FROM users WHERE id = ${id}`;
    if (!user) {
      console.warn(`[ROUTE] GET /users/${id} - User not found`);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log(`[ROUTE] GET /users/${id} - User found: ${user.email}`);
    res.json(user);
  } catch (err) {
    console.error(`[ROUTE] GET /users/${id} - Failed to fetch user:`, err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// CREATE user
router.post('/', async (req: Request, res: Response) => {
  const { name, email, role } = req.body;
  const is_active = req.body.is_active ?? true;
  try {
    console.log(`[ROUTE] POST /users - Creating user: ${email}`);
    const [newUser] = await sql`
      INSERT INTO users (name, email, role, is_active)
      VALUES (${name}, ${email}, ${role}, ${is_active})
      RETURNING *
    `;
    console.log(`[ROUTE] POST /users - User created with ID: ${newUser.id}`);
    res.status(201).json(newUser);
  } catch (err) {
    console.error('[ROUTE] POST /users - Failed to create user:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// UPDATE user
router.put('/:id', async (req: Request, res: Response): Promise<void | any> => {
  const id = Number(req.params.id);
  const { name, email, role, is_active } = req.body;
  try {
    console.log(`[ROUTE] PUT /users/${id} - Updating user`);
    const [updated] = await sql`
      UPDATE users
      SET name = ${name}, email = ${email}, role = ${role}, is_active = ${is_active}
      WHERE id = ${id}
      RETURNING *
    `;
    if (!updated) {
      console.warn(`[ROUTE] PUT /users/${id} - User not found`);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log(`[ROUTE] PUT /users/${id} - User updated`);
    res.json(updated);
  } catch (err) {
    console.error(`[ROUTE] PUT /users/${id} - Failed to update user:`, err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE user
router.delete('/:id', async (req: Request, res: Response): Promise<void | any> => {
  const id = Number(req.params.id);
  try {
    console.log(`[ROUTE] DELETE /users/${id} - Deleting user`);
    const [deleted] = await sql`DELETE FROM users WHERE id = ${id} RETURNING *`;
    if (!deleted) {
      console.warn(`[ROUTE] DELETE /users/${id} - User not found`);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log(`[ROUTE] DELETE /users/${id} - User deleted`);
    res.json({ message: 'User deleted', user: deleted });
  } catch (err) {
    console.error(`[ROUTE] DELETE /users/${id} - Failed to delete user:`, err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;

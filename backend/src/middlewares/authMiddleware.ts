import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { sql } from '../db';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];

  console.log('[AUTH] Incoming request...');

  if (!token) {
    console.warn('[AUTH] No token provided');
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    console.log('[AUTH] Verifying token...');
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    console.log('[AUTH] Token verified. Payload:', payload);

    if (!payload?.email || !payload.name) {
      console.error('[AUTH] Invalid token payload');
      res.status(400).json({ error: 'Invalid token payload' });
      return;
    }

    console.log(`[AUTH] Checking if user ${payload.email} exists...`);
    const existing = await sql`SELECT * FROM users WHERE email = ${payload.email}`;
    let user;

    if (existing.length === 0) {
      console.log('[AUTH] New user. Inserting into database...');
      const inserted = await sql`
        INSERT INTO users (email, name, role)
        VALUES (${payload.email}, ${payload.name}, 'editor')
        RETURNING *;
      `;
      user = inserted[0];
      console.log('[AUTH] User inserted:', user);
    } else {
      user = existing[0];
      console.log('[AUTH] Existing user found:', user);
    }

    req.user = {
      email: user.email,
      name: user.name,
      role: user.role,
    };

    console.log('[AUTH] Authenticated user attached to request:', req.user);

    next();
  } catch (err) {
    console.error('[AUTH] Token verification failed:', err);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        name: string;
        role: 'admin' | 'editor';
      };
    }
  }
}

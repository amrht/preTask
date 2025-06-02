import { Request } from 'express';

// Define the user object shape
interface User {
  email: string;
  name: string;
  role: 'admin' | 'editor';
}

// Extend Express Request to include user property
export interface AuthenticatedRequest extends Request {
  user?: User;
}

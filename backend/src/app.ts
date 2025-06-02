import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import userRoutes from './routes/userRoutes';
import artistRoutes from './routes/artistRoutes';
import contentRoutes from './routes/contentRoutes';
import logRoutes from './routes/logRoutes';

dotenv.config();

export const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/users', userRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/contents', contentRoutes);
app.use('/api/logs', logRoutes);

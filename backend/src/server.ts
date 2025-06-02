import { createServer } from 'http';
import { app } from './app';

const PORT = process.env.PORT || 5000;

createServer(app).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// utils/logger.ts
import { sql } from '../db'; // or your DB import

export const logAction = async (tableName: string, logText: string) => {
  try {
    await sql`
      INSERT INTO logs (table_name, log)
      VALUES (${tableName}, ${logText})
    `;
  } catch (err) {
    console.error('Failed to log action:', err);
  }
};

import dotenv from 'dotenv';
import path from 'path';

// Load .env from root or backend
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config(); // fallback to local cwd

export const env = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  DATABASE_URL: process.env.DATABASE_URL || 'mysql://root:1234@localhost:3306/urban_furniture_db',
  JWT_SECRET: process.env.JWT_SECRET || 'urban_furniture_super_secret_jwt_key_2026',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

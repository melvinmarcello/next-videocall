import mysql from 'mysql2/promise';

let db

export const connectToDatabase = async () => {
  if (!db) {
    try {
      db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: Number(process.env.DB_PORT) || 3306,
      });
      console.log('Connected to MySQL database');
    } catch (err) {
      console.error('Database connection failed:', err.message);
      throw err;
    }
  }
  return db;
};

import mariadb from 'mariadb';
import 'dotenv/config';
 
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5,
  connectTimeout: 10000
});
 
// Verbindung testen
pool.getConnection()
  .then(conn => {
    console.log('DB connection successfull.');
    conn.release();
  })
  .catch(err => {
    console.error('DB connection failed:', err);
  });
 
export default pool;
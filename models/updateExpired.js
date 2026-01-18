import pool from '../config/database.js';

export async function updateExpiredOffer(offer) {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query(
      `UPDATE cashback_offer SET expired = ? WHERE id = ?`,
      [
        true, 
        offer.id 
    ]);                     // vals for placeholders are passed as an arr
    return result;
  } finally {
    conn.release();
  }
}

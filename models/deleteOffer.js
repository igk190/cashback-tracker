import pool from '../config/database.js';

export async function deleteOffer(offer) {

  const conn = await pool.getConnection();
  let result;
  
  try { 

      result = await conn.query(
      `DELETE FROM cashback_offer
      
      WHERE id = ?`, 
      [ offer.id ]
    );
    console.log('result, ', result);
    return result;
  } finally {
    conn.release();
  }
}


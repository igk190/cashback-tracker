import pool from '../config/database.js';

export async function updateOffer(offer) {
  const conn = await pool.getConnection();
  let result;
  
  try { // we checked if offer.id in pages.js

      result = await conn.query(
      `UPDATE cashback_offer 
      SET
      product_name = ?, cashback_url = ?, photo_url = ?, 
      start_date = ?, end_date = ?, 
      price = ?, cashback_amount = ?,
      store = ?, conditions = ?,
      status = ?, purchase_date = ?
      
      WHERE id = ?`,
      [
        offer.product_name,
        offer.cashback_url || null,
        offer.photo_url || null,
        offer.start_date || null,
        offer.end_date || "",
        offer.price || null,
        offer.cashback_amount || null,
        offer.store || null,
        offer.conditions || null,
        offer.status,
        offer.purchase_date || null,
        offer.id
      ]
    );
    console.log('result, ', result);
    return result;
  } finally {
    conn.release();
  }
}


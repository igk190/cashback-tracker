import pool from '../config/database.js';

export async function addCashbackOffer(offer) {
  const conn = await pool.getConnection();
  let result;
  console.log("OFFER ID in cashback.js", offer)
  try {
    result = await conn.query(
      `INSERT INTO cashback_offer 
      (product_name, cashback_url, photo_url, start_date, end_date, price, cashback_amount, store, conditions, status, purchase_date, expired)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        offer.product_name,
        offer.cashback_url || null,
        offer.photo_url || null,
        offer.start_date || null,
        offer.end_date || null,
        offer.price || null,
        offer.cashback_amount || null,
        offer.store || null,
        offer.conditions || null,
        offer.status || "Available",
        offer.purchase_date || null,
        offer.expired || 0
      ]
    );
  
    console.log('result, ', result);
    return result;
  } finally {
    conn.release();
  }
}
// null, NaN, undefined

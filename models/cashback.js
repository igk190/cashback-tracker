import pool from '../config/database.js';

export async function addCashbackOffer(offer) {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query(
      `INSERT INTO cashback_offer 
      (product_name, cashback_url, photo_url, start_date, end_date, price, cashback_amount, store, conditions, status, purchase_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      ]
    );
    return result;
  } finally {
    conn.release();
  }
}

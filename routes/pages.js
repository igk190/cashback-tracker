import express from 'express';
import { addCashbackOffer } from '../models/cashback.js';
import pool from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
    res.render('index'); 

});

router.get('/dashboard', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const allCashbackOffers = await conn.query('SELECT * FROM cashback_offer');
    console.log("OFFERS", allCashbackOffers[3]);
    conn.release();

    // const offers = [
    //   {
    //     id: 1,
    //     product_name: 'Test Pokemon',
    //     photo_url: 'https://via.placeholder.com/150',
    //     status: 'Available',
    //     cashback_amount: '3.49',
    //     store: 'Kaufland',
    //     start_date: '2025-10-27',
    //     end_date: '2025-10-31',
    //     conditions: null,
    //     cashback_url: 'https://example.com',
    //     purchased_on: null
    //   }
    // ];
    res.render('dashboard', { allCashbackOffers, success_msg: req.flash('success_msg') });
  } catch (err) {
    console.error('Error:', err);
    req.flash('error_msg', 'Error loading offers.');
    res.render('dashboard', { allCashbackOffers: [], success_msg: req.flash('success_msg') });
  }
});

router.post('/cashback', async (req, res) => {
  try {
    await addCashbackOffer(req.body);
    req.flash('success_msg', 'Cashback offer added!');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error adding cashback offer.');
  }
  res.redirect('/dashboard'); // always redirect, no modal or prefill
});

export default router;
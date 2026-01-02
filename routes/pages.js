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

    let total_cashback_sum = 0;
    let total_offers_completed = 0;

    for (let index in allCashbackOffers){
      if (allCashbackOffers[index].status === "Completed" ) {
        total_cashback_sum += parseFloat(allCashbackOffers[index].cashback_amount);
 
        total_offers_completed += 1;
      }
    }

    

    res.render('dashboard', { allCashbackOffers, total_cashback_sum, total_offers_completed, success_msg: req.flash('success_msg') });
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


// console.log(typeof allCashbackOffers[index].cashback_amount ); // string! Returned as string, parseFloat
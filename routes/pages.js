import express from 'express';
import { addCashbackOffer } from '../models/cashback.js';
import pool from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
    res.render('index'); 

});

// -------- GET CARDS DATA FOR DASH --------

function getCompletedCardData(allCashbackOffers) {
  let total_cashback_sum = 0;
  let total_offers_completed = 0;

  for (let index in allCashbackOffers){
    if (allCashbackOffers[index].status === "Completed" ) {
      total_cashback_sum += parseFloat(allCashbackOffers[index].cashback_amount);
      total_offers_completed += 1;
    }
  }
  return [total_cashback_sum, total_offers_completed];
}

function getCashbackPendingCardData(allCashbackOffers) {
  let sum_pending = 0;
  let total_offers_pending = 0;

  for (let index in allCashbackOffers) {
    if (allCashbackOffers[index].status === 'Confirmed') {
      sum_pending += parseFloat(allCashbackOffers[index].cashback_amount);
      total_offers_pending += 1;
    }
  }
  return [sum_pending, total_offers_pending];
}

function getAvailableOfferCardData(allCashbackOffers) {
  let availableOfferTotalValue = 0;
  let availableOffers = 0;

  for (let i in allCashbackOffers) {
    if (allCashbackOffers[i].status === 'Available') {
      availableOffers += 1;
      if (allCashbackOffers[i].cashback_amount) { // if there is a cashback amount, sum it
        availableOfferTotalValue += parseFloat(allCashbackOffers[i].cashback_amount);
      }
    }    
  }

  return [availableOfferTotalValue, availableOffers];
}

// --------

router.get('/dashboard', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const allCashbackOffers = await conn.query('SELECT * FROM cashback_offer');
    console.log("OFFERS", allCashbackOffers[3]);
    conn.release();
    
    let [total_cashback_sum, total_offers_completed] = getCompletedCardData(allCashbackOffers); // 'Cashback received' card
    let [sum_pending, total_offers_pending] = getCashbackPendingCardData(allCashbackOffers); // 'Cashback pending' card
    let [availableOfferTotalValue, availableOffers] = getAvailableOfferCardData(allCashbackOffers);

    res.render('dashboard', { 
      allCashbackOffers, 
      total_cashback_sum, total_offers_completed,
      sum_pending, total_offers_pending,
      availableOfferTotalValue, availableOffers,
      success_msg: req.flash('success_msg') });
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


// console.log(typeof allCashbackOffers[index].cashback_amount ); // string! Returned as string, use parseFloat
// cashback_amount shouldn't be required on the form, often you only know post-purchase how much it cost 
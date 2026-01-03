import express from 'express';
import { addCashbackOffer } from '../models/cashback.js';
import pool from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
    res.render('index'); 

});

// -------- GET DATA FOR STATISTICS CARDS --------

function getCompletedCardData(allCashbackOffers) {

  const completedArr = allCashbackOffers.filter(o => o.status === "Completed");
  const completedCount = completedArr.length;
  const completedSum = completedArr.reduce((sum, o) => sum + (parseFloat(o.cashback_amount) || 0), 0);

  return [completedCount, completedSum];
}

function getCashbackConfirmedCardData(allCashbackOffers) {

  const confirmedArr = allCashbackOffers.filter(o => o.status === "Confirmed");
  const confirmedCount = confirmedArr.length;
  const confirmedSum = confirmedArr.reduce((sum, o) => sum + (parseFloat(o.cashback_amount) || 0), 0);
  
  return [confirmedCount, confirmedSum];
}

function getAvailableOfferCardData(allCashbackOffers) {

  const availableArr = allCashbackOffers.filter(o => o.status === "Available");
  const availableCount = availableArr.length;
  const availableSum = availableArr.reduce((sum, o) => sum + (parseFloat(o.cashback_amount) || 0), 0);
  
  return [availableCount, availableSum];
}

function getPurchasedData(allCashbackOffers) {
  
  const totalPurchasedArray = allCashbackOffers.filter(o => o.status === "Purchased");
  const purchasedOffers = totalPurchasedArray.length;
  const purchasedOffersTotalValue = totalPurchasedArray.reduce((sum, o) => sum + (o.cashback_amount ? parseFloat(o.cashback_amount) : 0 ), 0);
  
  return [purchasedOffers, purchasedOffersTotalValue];
}

function getUploadedData(allCashbackOffers) {
  
  const totalUploadedArray = allCashbackOffers.filter(o => o.status === "Uploaded");
  const uploadedOffers = totalUploadedArray.length;

  const uploadedOffersTotalValue = totalUploadedArray.reduce((sum, o) => sum + (o.cashback_amount ? parseFloat(o.cashback_amount) : 0), 0 );

  return [uploadedOffers, uploadedOffersTotalValue];
}

// ----------------


router.get('/dashboard', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const allCashbackOffers = await conn.query('SELECT * FROM cashback_offer');
    conn.release();
    
    let [availableCount, availableSum] = getAvailableOfferCardData(allCashbackOffers);
    let [confirmedCount, confirmedSum] = getCashbackConfirmedCardData(allCashbackOffers); // 'Cashback confirmed' card
    let [completedCount, completedSum] = getCompletedCardData(allCashbackOffers); // 'Cashback received' card
    let [purchasedOffers, purchasedOffersTotalValue] = getPurchasedData(allCashbackOffers);
    let [uploadedOffers, uploadedOffersTotalValue] = getUploadedData(allCashbackOffers);
    

    res.render('dashboard', { 
      allCashbackOffers, 

      availableSum, availableCount,
      purchasedOffers, purchasedOffersTotalValue,
      uploadedOffers, uploadedOffersTotalValue,

      confirmedSum, confirmedCount,
      completedSum, completedCount,

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
// use xxSum and xxCount next time.
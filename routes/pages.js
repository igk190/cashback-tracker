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

function getConfirmedCardData(allCashbackOffers) {

  const confirmedArr = allCashbackOffers.filter(o => o.status === "Confirmed");
  const confirmedCount = confirmedArr.length;
  const confirmedSum = confirmedArr.reduce((sum, o) => sum + (parseFloat(o.cashback_amount) || 0), 0);
  
  return [confirmedCount, confirmedSum];
}

function getAvailableCardData(allCashbackOffers) {

  const availableArr = allCashbackOffers.filter(o => o.status === "Available");
  const availableCount = availableArr.length;
  const availableSum = availableArr.reduce((sum, o) => sum + (parseFloat(o.cashback_amount) || 0), 0);
  
  return [availableCount, availableSum];
}

function getPurchasedData(allCashbackOffers) {
  
  const purchasedArr = allCashbackOffers.filter(o => o.status === "Purchased");
  const purchasedCount = purchasedArr.length;
  const purchasedSum = purchasedArr.reduce((sum, o) => sum + parseFloat(o.cashback_amount), 0);
  
  return [purchasedCount, purchasedSum];
}

function getUploadedData(allCashbackOffers) {
  
  const uploadedArr = allCashbackOffers.filter(o => o.status === "Uploaded");
  const uploadedCount = uploadedArr.length;
  const uploadedSum = uploadedArr.reduce((sum, o) => sum + parseFloat(o.cashback_amount), 0 );

  return [uploadedCount, uploadedSum];
}

function getTotalOffersTeilgenommen(allCashbackOffers) {
  const teilgenommenArr = allCashbackOffers.filter(o => o.status !== "Available");
  const teilgenommenCount = teilgenommenArr.length;
  const teilgenommenSum = teilgenommenArr.reduce((sum, o) => sum + parseFloat(o.cashback_amount), 0 ); // from purchased onward, offers WILL have a cashback_amount

  return [teilgenommenCount, teilgenommenSum];
}

// ----------------


router.get('/dashboard', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const allCashbackOffers = await conn.query('SELECT * FROM cashback_offer');
    conn.release();
    
    const [availableCount, availableSum] = getAvailableCardData(allCashbackOffers);
    const [confirmedCount, confirmedSum] = getConfirmedCardData(allCashbackOffers); // 'Cashback confirmed' card
    const [completedCount, completedSum] = getCompletedCardData(allCashbackOffers); // 'Cashback received' card
    const [purchasedCount, purchasedSum] = getPurchasedData(allCashbackOffers);
    const [uploadedCount, uploadedSum] = getUploadedData(allCashbackOffers);

    const [teilgenommenCount, teilgenommenSum] = getTotalOffersTeilgenommen(allCashbackOffers);

    res.render('dashboard', { 
      allCashbackOffers, 

      availableCount, availableSum,
      purchasedCount, purchasedSum,
      uploadedCount, uploadedSum,
      confirmedCount, confirmedSum,
      completedCount, completedSum,

      teilgenommenCount, teilgenommenSum,
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
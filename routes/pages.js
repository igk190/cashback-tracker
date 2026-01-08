import express from 'express';
import { addCashbackOffer } from '../models/cashback.js';
import pool from '../config/database.js';
import flash from 'connect-flash';

const router = express.Router();

router.get('/', async (req, res) => {
    res.render('index'); 
});

router.use(flash());

// -------- GET DATA FOR STATISTICS CARDS --------

function getCardStatNumbers(allCashbackOffers, cashbackStatus) {

  let arr = allCashbackOffers.filter(o => o.status === cashbackStatus);
  const statCount = arr.length;
  const statSum = arr.reduce((sum, o) => sum + (parseFloat(o.cashback_amount) || 0), 0 ); 

  return [statCount, statSum];
}

function getTotalOffersTeilgenommen(allCashbackOffers) {
  const teilgenommenArr = allCashbackOffers.filter(o => o.status !== "Available");
  const teilgenommenCount = teilgenommenArr.length;
  const teilgenommenSum = teilgenommenArr.reduce((sum, o) => sum + (parseFloat(o.cashback_amount) || 0), 0 ); 

  return [teilgenommenCount, teilgenommenSum];
}


function getAllStatCardData(allCashbackOffers) {
    const [availableCount, availableSum] = getCardStatNumbers(allCashbackOffers, "Available");
    const [confirmedCount, confirmedSum] = getCardStatNumbers(allCashbackOffers, "Confirmed"); // 'Cashback confirmed' card
    const [completedCount, completedSum] = getCardStatNumbers(allCashbackOffers, "Completed"); // 'Cashback received' card
    const [purchasedCount, purchasedSum] = getCardStatNumbers(allCashbackOffers, "Purchased");
    const [uploadedCount, uploadedSum] = getCardStatNumbers(allCashbackOffers, "Uploaded");
    const [teilgenommenCount, teilgenommenSum] = getTotalOffersTeilgenommen(allCashbackOffers);

    return [availableCount, availableSum, confirmedCount, confirmedSum, completedCount, completedSum,
      purchasedCount, purchasedSum, uploadedCount, uploadedSum, teilgenommenCount, teilgenommenSum];
}

// ---------------- FILTER ROUTES ----------------

router.get('/available', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const filteredOffers = await conn.query('SELECT * FROM cashback_offer where status = "Available"');
    const allCashbackOffers = await conn.query('SELECT * FROM cashback_offer');
    conn.release();

    const [availableCount, availableSum, confirmedCount, confirmedSum, completedCount, completedSum,
      purchasedCount, purchasedSum, uploadedCount, uploadedSum, teilgenommenCount, teilgenommenSum] = getAllStatCardData(allCashbackOffers);

    res.render('dashboard',  {
      filteredOffers, 
      availableCount, availableSum, 
      confirmedCount, confirmedSum, 
      completedCount, completedSum,
      purchasedCount, purchasedSum, 
      uploadedCount, uploadedSum, 
      teilgenommenCount, teilgenommenSum
    })
  } catch (err) {
    console.error('Error filtering "Available" offers:', err);
    res.render('dashboard', { 
      allCashbackOffers: [], 
      success_msg: req.flash('success_msg') 
      });

  } // end catch
});


// ---------------- DASHBOARD ----------------
router.get('/dashboard', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const allCashbackOffers = await conn.query('SELECT * FROM cashback_offer');
    conn.release();

    const [availableCount, availableSum, confirmedCount, confirmedSum, completedCount, completedSum,
      purchasedCount, purchasedSum, uploadedCount, uploadedSum, teilgenommenCount, teilgenommenSum] = getAllStatCardData(allCashbackOffers); 
    
    let filteredOffers;

    const {status} = req.query;
    console.log(status);

    if (status) {
      filteredOffers = allCashbackOffers.filter(o => o.status === status);
    } else {
      filteredOffers = allCashbackOffers;
    }
    res.render('dashboard', { 
      filteredOffers,

      availableCount, availableSum,
      purchasedCount, purchasedSum,
      uploadedCount, uploadedSum,
      confirmedCount, confirmedSum,
      completedCount, completedSum,
      teilgenommenCount, teilgenommenSum,

      success_msg: req.flash('success_msg') 
    });
  } catch (err) {
    console.error('Error:', err);
    req.flash('error_msg', 'Error loading offers.');
    res.render('dashboard', { filteredOffers: [], success_msg: req.flash('success_msg') });
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


/* 
Learnings

1. console.log(typeof allCashbackOffers[index].cashback_amount ); // string! Returned as string, use parseFloat
2. cashback_amount shouldn't be required on the form, often you only know post-purchase how much it cost 
3. write custom attributes if they start with data-*. Ex: <article id="flying-cars"... 
Then access all attr of this el through data-columns, data-index-numbers, etc. 

next todo: keep dashboard and one route. Add ?status=Available instead of new route for each filter button.
*/


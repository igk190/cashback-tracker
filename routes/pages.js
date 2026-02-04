import express from 'express';

import { addCashbackOffer } from '../models/cashback.js';
import { updateExpiredOffer } from '../models/updateExpired.js';
import { updateOffer } from '../models/updateOffer.js';

import pool from '../config/database.js';
import flash from 'connect-flash';

const router = express.Router();

router.get('/', async (req, res) => {
    res.render('index'); 
});

router.use(flash());


async function updateExpiredOffers(allCashbackOffers) {
  
  const todaysDate = new Date();

  for (const offer of allCashbackOffers) { 
    if (offer.end_date && todaysDate > offer.end_date ) {
      try {
        await updateExpiredOffer(offer.id)
          //console.log("OFFER END DATE:", offer.end_date, " IS BIGGER THAN TODAY:", todaysDate,  todaysDate > offer.end_date); 
          //console.log(typeof offer.end_date)
      } catch (err) {
        console.error(err);
      }
    } // end if... 
  } // end for
} // end func



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

    updateExpiredOffers(allCashbackOffers);

    if (status === "expired") {
      filteredOffers = allCashbackOffers.filter(o => o.expired === 1); // true === 1, false is 0
    }  else if (!status) {
      filteredOffers = allCashbackOffers.filter(o => o.status === "Available");
    } else if (status !== "expired") {
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


// UPDATE, DELETE, ADD NEW
router.post('/cashback', async (req, res) => {

  const method = req.body._method
  
  try {
    if (req.body.id > 0 && method === "DELETE") {             // DELETE
      /// send to delete offer
      req.flash('success_msg', 'Cashback offer deleted!'); 
    } else if (req.body.id > 0) {                            // UPDATE
      await updateOffer(req.body)
      req.flash('success_msg', 'Cashback offer added!');        // ADD NEW
    } else {
      await addCashbackOffer(req.body);
      req.flash('success_msg', 'Cashback offer added!');
    }

    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error updating, adding or deleting the cashback offer.');
  }
  res.redirect('/dashboard'); // always redirect
});




export default router;


/* 
Learnings

1. console.log(typeof allCashbackOffers[index].cashback_amount ); // string! Returned as string, use parseFloat
2. cashback_amount shouldn't be required on the form, often you only know post-purchase how much it cost 
3. write custom attributes if they start with data-*. Ex: <article id="flying-cars"... 
Then access all attr of this el through data-columns, data-index-numbers, etc. 

https://codesignal.com/learn/courses/practical-request-processing-with-mock-data/lessons/filtering-data-using-query-parameters-in-expressjs

in get Dashboard, we update expiredOffers. An offer shouldn't be status: Expired, just because
the date passed. It can be that you purchased it well within timeframe, and due date has passed, but
you're waiting for the companies' confirmation. 
*/


import express from 'express';
import { addCashbackOffer } from '../models/cashback.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.render('index'); 
});

router.get('/dashboard', (req, res) => {
  res.render('dashboard'); 
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
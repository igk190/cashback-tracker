import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import pool from '../config/database.js';

const router = express.Router();

// --------------------------------- REGISTER ---------------------------------

router.get('/register', (req, res) => {                         // RENDER PAGE
    res.render('register');
});

router.post('/register', async (req, res) => {                  // POST FORM
  const { username, name, email, password } = req.body;

  if (password.length < 8) {
    req.flash('error_msg', 'Must be at least 8 characters');
    return res.redirect('/register');
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const existing = await conn.query('SELECT id FROM user WHERE username = ? OR email = ?', [username, email] );

    if (existing.length > 0) {
      req.flash('error_msg', 'Username or email not available.');
      return res.redirect('/register');
    }

    const hashedPassword = await bcrypt.hash(password, 12);                             // hash the pw
 
    await conn.query('INSERT INTO user (username, name, email, password_hash) VALUES (?, ?, ?, ?)',
      [username, name, email, hashedPassword]
    );

    req.flash('success_msg', 'Registration successful! Proceed to login.');
    res.redirect('/register');

  } catch (error) {
    console.error('Registrierungsfehler:', error);
    req.flash('error_msg', 'Registration failed. Please try again.');
    res.redirect('/register');
  } finally {
    if (conn) conn.release();
  }
});



// --------------------------------- LOGIN ---------------------------------

router.get('/login', (req, res) => {                        // RENDER PAGE
  res.render('login');
});

router.post('/login', async (req, res) => {                 // POST FORM
  const { username, password } = req.body;

  let conn;
  try {
    conn = await pool.getConnection();

    const users = await conn.query('SELECT * FROM user WHERE username = ?', [username] );

    if (users.length === 0) {
      req.flash('error_msg', 'Incorrect username or password.');
      return res.redirect('/login');
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      req.flash('error_msg', 'Incorrect username or password');
      return res.redirect('/login');
    }

    const token = jwt.sign({     // create token
        id: user.id,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.cookie('token', token, {   // Set token as cookie
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    });

    req.flash('success_msg', 'You"re logged in!');
    res.redirect('/dashboard');

  } catch (error) {
    console.error('Login error:', error);
    req.flash('error_msg', 'Login failed.');
    res.redirect('/login');
  } finally {
    if (conn) conn.release();
  }
});

// --------------------------------- LOGIN ---------------------------------

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  req.flash('success_msg', 'You have logged out.');
  res.redirect('/login');
});

export default router;
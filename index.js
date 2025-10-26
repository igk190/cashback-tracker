import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './config/database.js';
import session from 'express-session';
import flash from 'connect-flash';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

//import pokemonRouter from './routes/pokemon.js';
import pagesRouter from './routes/pages.js';
import authRouter from './routes/auth.js';
import { optAuthMiddleware } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
dotenv.config();

app.use(express.json());                                                                    
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({                                                                            // built-in middleware provided by express-session. our code just registers the session middleware, and Express handles moving to the next middleware/route automatically
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET,
}));

app.use(flash()); 

app.use((req, res, next) => {                                                                // Make flash msg available for all templates
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
}) 

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));

app.use(optAuthMiddleware);

//app.use('/', pokemonRouter);  
app.use('/', pagesRouter);  
app.use('/', authRouter); 


app.listen(3000, () => {
  console.log('Server läuft auf http://localhost:3000');
});

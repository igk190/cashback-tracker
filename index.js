import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index'); 
});

app.get('/login', (req, res) => {
  res.render('login'); 
});
app.get('/register', (req, res) => {
  res.render('register'); 
});

app.listen(3000, () => {
  console.log('Server läuft auf http://localhost:3000');
});

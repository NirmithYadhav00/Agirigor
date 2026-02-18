require('dotenv').config();

const express   = require('express');
const session   = require('express-session');
const passport  = require('passport');
const helmet    = require('helmet');
const cors      = require('cors');
const morgan    = require('morgan');
const path      = require('path');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'agrigor-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', require('./routes/auth'));
app.use('/', require('./routes/pages'));

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
    return res.status(500).json({ message: 'Internal server error.' });
  }
  res.status(500).send('<h1>Something went wrong</h1>');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   🌾  Agrigor running on port ${PORT}   ║
  ║   http://localhost:${PORT}/login        ║
  ╚══════════════════════════════════════╝
  `);
});

module.exports = app;

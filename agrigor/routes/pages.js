// routes/pages.js  — serves every HTML page
const express = require('express');
const path    = require('path');
const router  = express.Router();

const views = p => path.join(__dirname, '../views', p);

// ── Auth guard middleware (inline) ──
function requireAuth(req, res, next) {
  if (req.session?.userId || req.headers.authorization) return next();
  res.redirect('/login?error=unauthorized');
}
function redirectIfLoggedIn(req, res, next) {
  if (req.session?.userId) return res.redirect('/dashboard');
  next();
}

// ── Public pages ──
router.get('/',                (req, res) => res.redirect('/login'));
router.get('/login',           redirectIfLoggedIn, (req, res) => res.sendFile(views('login.html')));
router.get('/register',        redirectIfLoggedIn, (req, res) => res.sendFile(views('register.html')));
router.get('/forgot-password', redirectIfLoggedIn, (req, res) => res.sendFile(views('forgot-password.html')));
router.get('/reset-password',                      (req, res) => res.sendFile(views('reset-password.html')));

// ── Protected pages ──
router.get('/dashboard', requireAuth, (req, res) => res.sendFile(views('dashboard.html')));
router.get('/profile',   requireAuth, (req, res) => res.sendFile(views('profile.html')));
router.get('/settings',  requireAuth, (req, res) => res.sendFile(views('settings.html')));

// ── 404 ──
router.use((req, res) => res.status(404).sendFile(views('404.html')));

module.exports = router;

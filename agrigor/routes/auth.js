const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const passport = require('passport');
const router   = express.Router();

let users = [];

router.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(422).json({ message: 'All fields are required.' });
    }

    const existingUser = users.find(
      user => user.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    users.push({
      id: crypto.randomBytes(16).toString('hex'),
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone
    });

    res.status(201).json({
      message: 'Account created successfully! Please sign in.',
      redirect: '/login?success=registered'
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

router.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({ message: 'Email and password are required.' });
    }

    const user = users.find(
      user => user.email === email.toLowerCase()
    );

    if (!user) {
      return res.status(400).json({ message: 'Mail not registered.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password.' });
    }

    req.session.userId = user.id;

    res.json({
      message: 'Login successful!',
      redirect: '/dashboard'
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

router.post('/api/logout', (req, res) => {
  req.session?.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out.', redirect: '/login?success=logout' });
  });
});

router.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(422).json({ message: 'Email is required.' });
    }

    res.json({ message: 'If that email exists, a reset link has been sent.' });

  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

router.post('/api/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(422).json({ message: 'Token and new password are required.' });
    }

    res.json({ message: 'Password reset successfully.', redirect: '/login?success=reset' });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=oauth_failed' }),
  (req, res) => {
    req.session.userId = req.user._id;
    res.redirect('/dashboard');
  }
);

module.exports = router;

function showToast(title, msg, type = 'error', duration = 4500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = {
    error:   '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    success: '<polyline points="20 6 9 17 4 12"/>',
    info:    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        ${icons[type] || icons.info}
      </svg>
    </div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${msg}</div>
    </div>
    <button class="toast-close" aria-label="Close">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>`;
  const dismiss = () => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  };
  toast.querySelector('.toast-close').addEventListener('click', dismiss);
  container.appendChild(toast);
  if (duration > 0) setTimeout(dismiss, duration);
}

function showInlineAlert(msg, type = 'error') {
  const box  = document.getElementById('inlineAlert');
  const icon = document.getElementById('inlineAlertIcon');
  const text = document.getElementById('inlineAlertMsg');
  if (!box) return;
  box.className = `inline-alert show ${type}`;
  text.textContent = msg;
  icon.innerHTML = type === 'error'
    ? '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
    : '<polyline points="20 6 9 17 4 12"/>';
}

function hideInlineAlert() {
  const box = document.getElementById('inlineAlert');
  if (box) box.className = 'inline-alert';
}

function setFieldError(inputId, errId, show, msg = null) {
  const inp = document.getElementById(inputId);
  const err = document.getElementById(errId);
  if (!inp || !err) return;
  inp.classList.toggle('invalid', show);
  err.classList.toggle('show', show);
  if (msg) err.textContent = msg;
}

function clearField(inputId, errId) { 
  setFieldError(inputId, errId, false); 
}

function setLoading(btnId, on, loadingText = 'Please wait…', defaultText = null) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = on;
  btn.classList.toggle('loading', on);
  const textEl = btn.querySelector('.btn-text');
  if (textEl) {
    if (on) { 
      btn.dataset.defaultText = textEl.textContent; 
      textEl.textContent = loadingText; 
    } else { 
      textEl.textContent = defaultText || btn.dataset.defaultText || 'Submit'; 
    }
  }
}

function initPasswordToggle(inputId, btnId, iconId) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.addEventListener('click', () => {
    const pw = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    const showing = pw.type === 'text';
    pw.type = showing ? 'password' : 'text';
    icon.innerHTML = showing
      ? '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>'
      : '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
  });
}

function checkPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function updateStrengthBar(barId, labelId, password) {
  const bar   = document.getElementById(barId);
  const label = document.getElementById(labelId);
  if (!bar || !password) return;
  const score = checkPasswordStrength(password);
  bar.className = `strength-bar s${score}`;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#ff6b6b', '#d4a373', '#66bb6a', '#2e7d32'];
  if (label) { 
    label.textContent = labels[score] || ''; 
    label.style.color = colors[score]; 
  }
}

function handleUrlParams() {
  const params  = new URLSearchParams(window.location.search);
  const error   = params.get('error');
  const success = params.get('success');
  const msg     = params.get('message');

  const errorMap = {
    oauth_failed:    'Google sign-in failed. Please try again.',
    account_exists:  'An account with this email already exists.',
    session_expired: 'Your session expired. Please sign in again.',
    unauthorized:    'You must be logged in to access that page.',
  };

  const successMap = {
    registered: 'Account created! Please sign in.',
    verified:   'Email verified! You can now sign in.',
    reset:      'Password reset successfully. Please sign in.',
    logout:     'You have been logged out.',
  };

  if (error) {
    const text = errorMap[error] || msg || 'Something went wrong.';
    showInlineAlert(text, 'error');
    showToast('Notice', text, 'error');
  }

  if (success) {
    const text = successMap[success] || msg || 'Success!';
    showInlineAlert(text, 'success');
    showToast('', text, 'success');
  }

  if (error || success) {
    window.history.replaceState({}, '', window.location.pathname);
  }
}

function googleSignIn(url = '/auth/google') {
  showToast('Redirecting', 'Taking you to Google sign-in…', 'info', 2500);
  setTimeout(() => { 
    window.location.href = url; 
  }, 600);
}

const LOGO_SVG = `
  <svg viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 28V10" stroke="#fefae0" stroke-width="2" stroke-linecap="round"/>
    <path d="M17 16C17 16 12 14 10 9C15 8 19 11 17 16Z" fill="#a5d6a7" stroke="#c8e6c9" stroke-width="0.5"/>
    <path d="M17 20C17 20 22 17 25 12C20 11 16 14 17 20Z" fill="#81c784" stroke="#a5d6a7" stroke-width="0.5"/>
    <circle cx="17" cy="8" r="2.5" fill="#d4a373"/>
    <path d="M10 29 Q17 25 24 29" stroke="#a5d6a7" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  </svg>`;

const GOOGLE_SVG = `
  <svg class="google-logo" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>`;

document.addEventListener('DOMContentLoaded', handleUrlParams);

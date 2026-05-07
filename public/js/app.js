(() => {
  const API_BASE = '/api';

  const heroCta = document.getElementById('hero-cta');
  const authSection = document.getElementById('auth-section');
  const dashboardSection = document.getElementById('dashboard-section');
  const adminSection = document.getElementById('admin-section');
  const userEmailEl = document.getElementById('user-email');
  const rolePill = document.getElementById('role-pill');
  const navLoginBtn = document.getElementById('nav-login-btn');
  const logoutBtn = document.getElementById('logout-btn');

  const toggleLoginBtn = document.getElementById('toggle-login');
  const toggleRegisterBtn = document.getElementById('toggle-register');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const authMessage = document.getElementById('auth-message');
  const otpForm = document.getElementById('otp-form');
  const otpEmailInput = document.getElementById('otp-email');
  const otpCodeInput = document.getElementById('otp-code');

  const feedbackForm = document.getElementById('feedback-form');
  const feedbackCards = document.getElementById('feedback-cards');
  const feedbackEmpty = document.getElementById('feedback-empty');
  const refreshFeedbackBtn = document.getElementById('refresh-feedback');

  const adminCards = document.getElementById('admin-cards');
  const adminEmpty = document.getElementById('admin-empty');
  const refreshAdminBtn = document.getElementById('refresh-admin');

  const toastEl = document.getElementById('toast');

  let authToken = null;
  let authUser = null;
  let countdownIntervals = new Map(); // id -> intervalId
  let editingFeedbackId = null;
  let pendingEmailForOtp = '';

  function showToast(text, duration = 2600) {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.hidden = false;
    clearTimeout(toastEl._timeout);
    toastEl._timeout = setTimeout(() => {
      toastEl.hidden = true;
    }, duration);
  }

  function setAuthState(token, user) {
    authToken = token;
    authUser = user;
    updateUIForAuth();
  }

  // Start every visit in a clean logged-out state; no automatic restore.
  function restoreAuth() {
    authToken = null;
    authUser = null;
    updateUIForAuth();
  }

  function updateUIForAuth() {
    if (authUser && authToken) {
      authSection.hidden = true;
      dashboardSection.hidden = false;
      if (navLoginBtn) navLoginBtn.hidden = true;
      logoutBtn.hidden = false;
      userEmailEl.textContent = authUser.email;
      rolePill.textContent = `ROLE: ${authUser.role.toUpperCase()}`;
      if (authUser.role === 'admin') {
        adminSection.hidden = false;
      } else {
        adminSection.hidden = true;
      }
    } else {
      authSection.hidden = false;
      dashboardSection.hidden = true;
      adminSection.hidden = true;
      if (navLoginBtn) navLoginBtn.hidden = false;
      logoutBtn.hidden = true;
      userEmailEl.textContent = 'Welcome. Please sign in.';
      clearAllCountdowns();
    }
  }

  function clearAllCountdowns() {
    countdownIntervals.forEach((id) => clearInterval(id));
    countdownIntervals.clear();
  }

  function switchConsole(mode) {
    // Hide all forms first
    loginForm.classList.remove('active');
    registerForm.classList.remove('active');
    if (otpForm) otpForm.classList.remove('active');
    toggleLoginBtn.classList.remove('active');
    toggleRegisterBtn.classList.remove('active');

    if (mode === 'login') {
      toggleLoginBtn.classList.add('active');
      loginForm.classList.add('active');
    } else if (mode === 'register') {
      toggleRegisterBtn.classList.add('active');
      registerForm.classList.add('active');
    } else if (mode === 'otp') {
      if (otpForm) otpForm.classList.add('active');
    }

    authMessage.textContent = '';
  }

  async function apiRequest(path, options = {}) {
    const headers = options.headers || {};
    headers['Content-Type'] = 'application/json';
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
    let data;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    if (!res.ok) {
      const msg =
        data && data.message ? data.message : `Request failed (${res.status})`;
      const error = new Error(msg);
      error.status = res.status;
      throw error;
    }
    return data;
  }

  async function handleAuth(e, mode) {
    e.preventDefault();
    authMessage.textContent = '';
    const email =
      mode === 'login'
        ? document.getElementById('login-email').value.trim()
        : document.getElementById('register-email').value.trim();
    const password =
      mode === 'login'
        ? document.getElementById('login-password').value
        : document.getElementById('register-password').value;

    if (!email || !password) {
      authMessage.textContent = 'Email & password required.';
      return;
    }

    try {
      const data = await apiRequest(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (mode === 'register') {
        // Move to OTP verification step
        pendingEmailForOtp = email;
        if (otpEmailInput) otpEmailInput.value = email;
        switchConsole('otp');
        showToast('Verification code sent. Check your email.');
      } else {
        setAuthState(data.token, data.user);
        showToast('Access granted.');
        fetchFeedback();
        if (data.user.role === 'admin') {
          fetchAdminFeedback();
        }
      }
    } catch (err) {
      authMessage.textContent = err.message;
      showToast(err.message || 'Authentication failed');
    }
  }

  async function fetchFeedback() {
    if (!authToken) return;
    try {
      const data = await apiRequest('/feedback', { method: 'GET' });
      renderFeedbackCards(data);
    } catch (err) {
      showToast(err.message || 'Failed to fetch feedback');
      throw err;
    }
  }

  async function fetchAdminFeedback() {
    if (!authToken || !authUser || authUser.role !== 'admin') return;
    try {
      const data = await apiRequest('/admin/feedback', { method: 'GET' });
      renderAdminCards(data);
    } catch (err) {
      showToast(err.message || 'Failed to fetch admin grid');
      throw err;
    }
  }

  function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleString();
  }

  function startCountdown(element, createdAt, feedbackId, locked) {
    if (!element) return;
    if (countdownIntervals.has(feedbackId)) {
      clearInterval(countdownIntervals.get(feedbackId));
    }

    const FIFTEEN_MIN = 15 * 60 * 1000;
    function update() {
      const created = new Date(createdAt).getTime();
      const remaining = FIFTEEN_MIN - (Date.now() - created);
      if (remaining <= 0 || locked) {
        element.dataset.state = 'expired';
        element.textContent = 'EDIT WINDOW: LOCKED';
        return true;
      }
      const totalSeconds = Math.floor(remaining / 1000);
      const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
      const secs = String(totalSeconds % 60).padStart(2, '0');
      element.dataset.state = 'active';
      element.textContent = `EDIT WINDOW: ${mins}:${secs}`;
      return false;
    }

    const finished = update();
    if (finished) {
      element.dataset.state = 'expired';
      element.textContent = 'EDIT WINDOW: LOCKED';
      return;
    }

    const id = setInterval(() => {
      const done = update();
      if (done) {
        clearInterval(id);
      }
    }, 1000);
    countdownIntervals.set(feedbackId, id);
  }

  function renderFeedbackCards(list) {
    clearAllCountdowns();
    feedbackCards.innerHTML = '';
    if (!list || list.length === 0) {
      feedbackEmpty.hidden = false;
      return;
    }
    feedbackEmpty.hidden = true;
    const now = Date.now();
    const FIFTEEN_MIN = 15 * 60 * 1000;

    list.forEach((item) => {
      const created = new Date(item.createdAt).getTime();
      const diff = now - created;
      const isLocked = diff > FIFTEEN_MIN;

      const card = document.createElement('article');
      card.className = 'card';
      card.dataset.id = item._id;

      const header = document.createElement('div');
      header.className = 'card-header';

      const titleEl = document.createElement('div');
      titleEl.className = 'card-title';
      titleEl.textContent = item.title;

      const meta = document.createElement('div');
      meta.className = 'card-meta';
      meta.innerHTML = `<span>Created</span><span>${formatDate(
        item.createdAt
      )}</span>`;

      header.appendChild(titleEl);
      header.appendChild(meta);

      const body = document.createElement('div');
      body.className = 'card-body';
      body.textContent = item.message;

      const footer = document.createElement('div');
      footer.className = 'card-footer';

      const countdown = document.createElement('span');
      countdown.className = 'countdown';

      const actions = document.createElement('div');

      if (isLocked) {
        countdown.dataset.state = 'expired';
        countdown.textContent = 'EDIT WINDOW: LOCKED';
        const lock = document.createElement('span');
        lock.className = 'lock-indicator';
        lock.innerHTML =
          '<svg viewBox="0 0 16 16"><path fill="currentColor" d="M11 6V4.5A3.5 3.5 0 0 0 4 4.5V6h-.5A1.5 1.5 0 0 0 2 7.5v5A1.5 1.5 0 0 0 3.5 14h9A1.5 1.5 0 0 0 14 12.5v-5A1.5 1.5 0 0 0 12.5 6H11Zm-1 0H6V4.5a2 2 0 1 1 4 0Z"/></svg><span>Locked</span>';
        actions.appendChild(lock);
      } else {
        const btn = document.createElement('button');
        btn.className = 'btn-ghost';
        btn.textContent = 'Edit';
        btn.addEventListener('click', () => openEditModal(item));
        actions.appendChild(btn);
      }

      footer.appendChild(countdown);
      footer.appendChild(actions);

      card.appendChild(header);
      card.appendChild(body);
      card.appendChild(footer);

      feedbackCards.appendChild(card);

      startCountdown(countdown, item.createdAt, item._id, isLocked);
    });
  }

  function renderAdminCards(list) {
    adminCards.innerHTML = '';
    if (!list || list.length === 0) {
      adminEmpty.hidden = false;
      return;
    }
    adminEmpty.hidden = true;

    list.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'card';
      card.dataset.id = item._id;

      const header = document.createElement('div');
      header.className = 'card-header';

      const titleEl = document.createElement('div');
      titleEl.className = 'card-title';
      titleEl.textContent = item.title;

      const meta = document.createElement('div');
      meta.className = 'card-meta';
      const owner = item.user && item.user.email ? item.user.email : 'Unknown';
      meta.innerHTML = `<span>${owner}</span><span>${formatDate(
        item.createdAt
      )}</span>`;

      header.appendChild(titleEl);
      header.appendChild(meta);

      const body = document.createElement('div');
      body.className = 'card-body';
      body.textContent = item.message;

      card.appendChild(header);
      card.appendChild(body);

      adminCards.appendChild(card);
    });
  }

  function openEditModal(item) {
    // For simplicity, just alert that editing is locked or allowed based on timer;
    // actual edit UI could be added here later if needed.
    editingFeedbackId = item._id;
    showToast('Editing is only allowed within 15 minutes of creation.');
  }

  async function submitFeedback(e) {
    e.preventDefault();
    const title = document.getElementById('feedback-title').value.trim();
    const message = document.getElementById('feedback-message').value.trim();
    if (!title || !message) {
      showToast('Title & message required.');
      return;
    }
    try {
      await apiRequest('/feedback', {
        method: 'POST',
        body: JSON.stringify({ title, message }),
      });
      feedbackForm.reset();
      showToast('Feedback captured.');
      fetchFeedback();
    } catch (err) {
      showToast(err.message || 'Failed to send feedback');
    }
  }

  function logout() {
    setAuthState(null, null);
    showToast('Logged out.');
  }

  toggleLoginBtn.addEventListener('click', () => switchConsole('login'));
  toggleRegisterBtn.addEventListener('click', () => switchConsole('register'));

  if (navLoginBtn) {
    navLoginBtn.addEventListener('click', () => {
      authSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      switchConsole('login');
    });
  }

  loginForm.addEventListener('submit', (e) => handleAuth(e, 'login'));
  registerForm.addEventListener('submit', (e) => handleAuth(e, 'register'));

  refreshFeedbackBtn.addEventListener('click', fetchFeedback);

  if (feedbackForm) {
    feedbackForm.addEventListener('submit', submitFeedback);
  }

  if (otpForm) {
    otpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (otpEmailInput?.value || pendingEmailForOtp || '').trim();
      const code = (otpCodeInput?.value || '').trim();
      if (!email || !code) {
        authMessage.textContent = 'Email and code required.';
        return;
      }
      authMessage.textContent = '';
      try {
        const data = await apiRequest('/auth/verify-otp', {
          method: 'POST',
          body: JSON.stringify({ email, code }),
        });
        setAuthState(data.token, data.user);
        showToast('Account verified.');
        fetchFeedback();
        if (data.user.role === 'admin') {
          fetchAdminFeedback();
        }
      } catch (err) {
        authMessage.textContent = err.message;
        showToast(err.message || 'Verification failed');
      }
    });
  }

  if (refreshAdminBtn) {
    refreshAdminBtn.addEventListener('click', fetchAdminFeedback);
  }

  logoutBtn.addEventListener('click', logout);

  if (heroCta && authSection) {
    heroCta.addEventListener('click', () => {
      authSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  // Default to login view and ensure a clean logged-out state.
  switchConsole('login');
  restoreAuth();
})();


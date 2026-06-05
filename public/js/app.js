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
  const adminStatsEl = document.getElementById('admin-stats');
  const refreshAdminBtn = document.getElementById('refresh-admin');

  const editModalBackdrop = document.getElementById('edit-modal-backdrop');
  const editModalClose = document.getElementById('edit-modal-close');
  const editForm = document.getElementById('edit-form');
  const editTitle = document.getElementById('edit-title');
  const editMessage = document.getElementById('edit-message');
  const editCategory = document.getElementById('edit-category');
  const editFormMessage = document.getElementById('edit-form-message');

  const registerRole = document.getElementById('register-role');
  const adminSecretWrap = document.getElementById('admin-secret-wrap');
  const adminSecretInput = document.getElementById('register-admin-secret');

  const toastEl = document.getElementById('toast');

  let authToken = null;
  let authUser = null;
  let countdownIntervals = new Map(); // id -> intervalId
  let editingFeedbackId = null;
  let pendingEmailForOtp = '';
  let allAdminFeedback = [];

  const CATEGORY_LABELS = {
    classroom: 'Classroom',
    food: 'Food',
    campus: 'Campus',
    facilities: 'Facilities',
    technology: 'Technology',
    other: 'Other',
  };

  const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High' };
  const STATUS_LABELS = {
    open: 'Open',
    in_progress: 'In progress',
    resolved: 'Resolved',
  };

  function categoryLabel(key) {
    return CATEGORY_LABELS[key] || 'Other';
  }

  function priorityLabel(key) {
    return PRIORITY_LABELS[key] || 'Medium';
  }

  function statusLabel(key) {
    return STATUS_LABELS[key] || 'Open';
  }

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
    const loggedIn = !!(authUser && authToken);
    document.body.classList.toggle('logged-in', loggedIn);

    if (loggedIn) {
      authSection.hidden = true;
      userEmailEl.textContent = authUser.name
        ? `Hi, ${authUser.name}`
        : authUser.email;

      const isAdmin = authUser.role === 'admin';
      if (rolePill) {
        rolePill.textContent = isAdmin ? 'ROLE: MANAGEMENT' : 'ROLE: USER';
      }

      if (isAdmin) {
        dashboardSection.hidden = true;
        adminSection.hidden = false;
        fetchAdminFeedback();
        fetchAdminStats();
      } else {
        dashboardSection.hidden = false;
        adminSection.hidden = true;
      }
    } else {
      authSection.hidden = false;
      dashboardSection.hidden = true;
      adminSection.hidden = true;
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
      syncRegisterRoleFields();
    } else if (mode === 'otp') {
      if (otpForm) otpForm.classList.add('active');
    }

    authMessage.textContent = '';
  }

  function syncRegisterRoleFields() {
    if (!registerRole || !adminSecretWrap || !adminSecretInput) return;
    const isAdmin = registerRole.value === 'admin';
    adminSecretWrap.classList.toggle('is-hidden', !isAdmin);
    adminSecretInput.required = isAdmin;
    if (!isAdmin) {
      adminSecretInput.value = '';
    }
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

    const payload = { email, password };
    if (mode === 'register') {
      const name = document.getElementById('register-name')?.value.trim();
      if (!name) {
        authMessage.textContent = 'Name is required.';
        return;
      }
      payload.name = name;
      const role = registerRole ? registerRole.value : 'user';
      payload.role = role;
      if (role === 'admin') {
        payload.adminSecret = (adminSecretInput?.value || '').trim();
        if (!payload.adminSecret) {
          authMessage.textContent = 'Management access code is required.';
          return;
        }
      }
    }

    try {
      const data = await apiRequest(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify(payload),
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
        if (data.user.role === 'admin') {
          fetchAdminFeedback();
          fetchAdminStats();
        } else {
          fetchFeedback();
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
      allAdminFeedback = data || [];
      applyAdminCategoryFilter();
    } catch (err) {
      showToast(err.message || 'Failed to fetch admin grid');
      throw err;
    }
  }

  async function fetchAdminStats() {
    if (!authToken || !authUser || authUser.role !== 'admin' || !adminStatsEl) return;
    try {
      const data = await apiRequest('/admin/stats', { method: 'GET' });
      renderAdminStats(data);
    } catch (err) {
      showToast(err.message || 'Failed to load stats');
    }
  }

  function renderAdminStats(data) {
    if (!adminStatsEl || !data) return;
    const cats = data.categoryCounts || {};
    adminStatsEl.innerHTML = `
      <div class="stat-card"><span class="stat-label">Total users</span><span class="stat-value">${data.userCount || 0}</span></div>
      <div class="stat-card"><span class="stat-label">Total feedback</span><span class="stat-value">${data.feedbackCount || 0}</span></div>
      <div class="stat-card"><span class="stat-label">Classroom</span><span class="stat-value">${cats.classroom || 0}</span></div>
      <div class="stat-card"><span class="stat-label">Food</span><span class="stat-value">${cats.food || 0}</span></div>
      <div class="stat-card"><span class="stat-label">Campus</span><span class="stat-value">${cats.campus || 0}</span></div>
      <div class="stat-card"><span class="stat-label">Facilities</span><span class="stat-value">${cats.facilities || 0}</span></div>
      <div class="stat-card"><span class="stat-label">Technology</span><span class="stat-value">${cats.technology || 0}</span></div>
      <div class="stat-card"><span class="stat-label">Other</span><span class="stat-value">${cats.other || 0}</span></div>
      <div class="stat-card"><span class="stat-label">Open</span><span class="stat-value">${(data.statusCounts && data.statusCounts.open) || 0}</span></div>
      <div class="stat-card"><span class="stat-label">In progress</span><span class="stat-value">${(data.statusCounts && data.statusCounts.in_progress) || 0}</span></div>
      <div class="stat-card"><span class="stat-label">Resolved</span><span class="stat-value">${(data.statusCounts && data.statusCounts.resolved) || 0}</span></div>
    `;
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
      meta.innerHTML = `<span>${categoryLabel(item.category)}</span><span>${formatDate(
        item.createdAt
      )}</span>`;

      header.appendChild(titleEl);
      header.appendChild(meta);

      const tagRow = document.createElement('div');
      const priPill = document.createElement('span');
      priPill.className = 'priority-pill';
      priPill.dataset.priority = item.priority || 'medium';
      priPill.textContent = priorityLabel(item.priority);
      const catPill = document.createElement('span');
      catPill.className = 'category-pill';
      catPill.textContent = categoryLabel(item.category);
      tagRow.appendChild(priPill);
      tagRow.appendChild(catPill);

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
      card.appendChild(tagRow);
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
      meta.innerHTML = `<span>From: Anonymous</span><span>${formatDate(
        item.createdAt
      )}</span>`;

      header.appendChild(titleEl);
      header.appendChild(meta);

      const tagRow = document.createElement('div');
      const priPill = document.createElement('span');
      priPill.className = 'priority-pill';
      priPill.dataset.priority = item.priority || 'medium';
      priPill.textContent = priorityLabel(item.priority);
      const catPill = document.createElement('span');
      catPill.className = 'category-pill';
      catPill.textContent = categoryLabel(item.category);
      tagRow.appendChild(priPill);
      tagRow.appendChild(catPill);

      const body = document.createElement('div');
      body.className = 'card-body';
      body.textContent = item.message;

      const statusRow = document.createElement('div');
      statusRow.className = 'card-footer';
      const statusSelect = document.createElement('select');
      statusSelect.className = 'status-select';
      ['open', 'in_progress', 'resolved'].forEach((s) => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = statusLabel(s);
        if ((item.status || 'open') === s) opt.selected = true;
        statusSelect.appendChild(opt);
      });
      statusSelect.addEventListener('change', async () => {
        try {
          await apiRequest(`/admin/feedback/${item._id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: statusSelect.value }),
          });
          item.status = statusSelect.value;
          showToast('Status updated.');
          fetchAdminStats();
        } catch (err) {
          showToast(err.message || 'Status update failed');
          statusSelect.value = item.status || 'open';
        }
      });
      statusRow.appendChild(statusSelect);

      card.appendChild(header);
      card.appendChild(tagRow);
      card.appendChild(body);
      card.appendChild(statusRow);

      adminCards.appendChild(card);
    });
  }

  function applyAdminCategoryFilter() {
    const catEl = document.getElementById('admin-category-filter');
    const statusEl = document.getElementById('admin-status-filter');
    const cat = catEl ? catEl.value : 'all';
    const status = statusEl ? statusEl.value : 'all';

    let filtered = allAdminFeedback;
    if (cat !== 'all') {
      filtered = filtered.filter((item) => item.category === cat);
    }
    if (status !== 'all') {
      filtered = filtered.filter((item) => (item.status || 'open') === status);
    }
    renderAdminCards(filtered);
  }

  function openEditModal(item) {
    editingFeedbackId = item._id;
    if (editTitle) editTitle.value = item.title;
    if (editMessage) editMessage.value = item.message;
    if (editCategory) editCategory.value = item.category || 'other';
    const editPriority = document.getElementById('edit-priority');
    if (editPriority) editPriority.value = item.priority || 'medium';
    if (editFormMessage) editFormMessage.textContent = '';
    if (editModalBackdrop) editModalBackdrop.classList.remove('is-hidden');
  }

  function closeEditModal() {
    editingFeedbackId = null;
    if (editModalBackdrop) editModalBackdrop.classList.add('is-hidden');
  }

  async function submitEdit(e) {
    e.preventDefault();
    if (!editingFeedbackId) return;
    const title = editTitle?.value.trim();
    const message = editMessage?.value.trim();
    const category = editCategory?.value || 'other';
    const priority = document.getElementById('edit-priority')?.value || 'medium';
    if (!title || !message) {
      if (editFormMessage) editFormMessage.textContent = 'Title and message required.';
      return;
    }
    try {
      await apiRequest(`/feedback/${editingFeedbackId}`, {
        method: 'PUT',
        body: JSON.stringify({ title, message, category, priority }),
      });
      closeEditModal();
      showToast('Feedback updated.');
      fetchFeedback();
    } catch (err) {
      if (editFormMessage) editFormMessage.textContent = err.message;
      if (err.message.toLowerCase().includes('expired')) {
        closeEditModal();
        fetchFeedback();
      }
    }
  }

  async function submitFeedback(e) {
    e.preventDefault();
    const title = document.getElementById('feedback-title').value.trim();
    const message = document.getElementById('feedback-message').value.trim();
    const category = document.getElementById('feedback-category')?.value || 'other';
    const priority = document.getElementById('feedback-priority')?.value || 'medium';
    if (!title || !message) {
      showToast('Title & message required.');
      return;
    }
    try {
      await apiRequest('/feedback', {
        method: 'POST',
        body: JSON.stringify({ title, message, category, priority }),
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
        if (data.user.role === 'admin') {
          fetchAdminFeedback();
          fetchAdminStats();
        } else {
          fetchFeedback();
        }
      } catch (err) {
        authMessage.textContent = err.message;
        showToast(err.message || 'Verification failed');
      }
    });
  }

  if (refreshAdminBtn) {
    refreshAdminBtn.addEventListener('click', () => {
      fetchAdminFeedback();
      fetchAdminStats();
    });
  }

  if (editModalClose) editModalClose.addEventListener('click', closeEditModal);
  if (editModalBackdrop) {
    editModalBackdrop.addEventListener('click', (e) => {
      if (e.target === editModalBackdrop) closeEditModal();
    });
  }
  if (editForm) editForm.addEventListener('submit', submitEdit);

  const adminCategoryFilter = document.getElementById('admin-category-filter');
  const adminStatusFilter = document.getElementById('admin-status-filter');
  if (adminCategoryFilter) {
    adminCategoryFilter.addEventListener('change', applyAdminCategoryFilter);
  }
  if (adminStatusFilter) {
    adminStatusFilter.addEventListener('change', applyAdminCategoryFilter);
  }

  logoutBtn.addEventListener('click', logout);

  if (heroCta && authSection) {
    heroCta.addEventListener('click', () => {
      authSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      switchConsole('login');
    });
  }

  document.querySelectorAll('.toggle-password').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.classList.toggle('is-visible', show);
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  });

  if (registerRole) {
    registerRole.addEventListener('change', syncRegisterRoleFields);
  }

  // Default to login view and ensure a clean logged-out state.
  document.body.classList.remove('logged-in');
  syncRegisterRoleFields();
  switchConsole('login');
  restoreAuth();
})();


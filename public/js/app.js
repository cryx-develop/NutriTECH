(function () {
  const AUTH_TOKEN_KEY = 'nutritech_token';
  const AUTH_USER_KEY = 'nutritech_user';
  const API_BASE = '/api';

  function getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY) || '';
  }

  function setAuthToken(token, user) {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }

    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  }

  function clearAuthToken() {
    setAuthToken('', null);
  }

  function isAuthenticated() {
    return Boolean(getAuthToken());
  }

  function getStoredUser() {
    try {
      const item = localStorage.getItem(AUTH_USER_KEY);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      return null;
    }
  }

  async function apiRequest(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = getAuthToken();
    if (token) {
      headers['x-auth-token'] = token;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Cererea a eșuat.');
    }
    return data;
  }

  function getDisplayName(user) {
    if (!user) return 'Utilizator';
    return user.name || user.email || 'Utilizator';
  }

  function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  async function saveProfile(profileData) {
    if (!profileData) return null;
    if (!isAuthenticated()) {
      localStorage.setItem('nutritech_profile', JSON.stringify(profileData));
      return profileData;
    }
    return apiRequest('/profile', { method: 'POST', body: profileData });
  }

  async function loadProfile() {
    if (!isAuthenticated()) {
      try {
        return JSON.parse(localStorage.getItem('nutritech_profile') || 'null');
      } catch (error) {
        return null;
      }
    }
    const data = await apiRequest('/me');
    return data?.profile || null;
  }

  async function saveDailyLog(logData) {
    const payload = {
      logDate: logData.logDate || getTodayKey(),
      targetCalories: logData.targetCalories || 0,
      consumedCalories: logData.consumedCalories || 0,
      burnedCalories: logData.burnedCalories || 0,
      waterMl: logData.waterMl || 0,
      sleepHours: logData.sleepHours || 0,
      foods: logData.foods || [],
      exercises: logData.exercises || [],
      recommendations: logData.recommendations || []
    };

    if (!isAuthenticated()) {
      localStorage.setItem(`nutritech_daily_log_${payload.logDate}`, JSON.stringify(payload));
      return payload;
    }

    return apiRequest('/daily-log', { method: 'POST', body: payload });
  }

  async function loadDailyLog(date = getTodayKey()) {
    if (!isAuthenticated()) {
      try {
        return JSON.parse(localStorage.getItem(`nutritech_daily_log_${date}`) || 'null');
      } catch (error) {
        return null;
      }
    }
    return apiRequest(`/daily-log/${date}`);
  }

  async function saveQuizResult(resultData) {
    if (!isAuthenticated()) {
      localStorage.setItem('nutritech_quiz_result', JSON.stringify(resultData));
      return { ok: true };
    }
    return apiRequest('/quiz-result', { method: 'POST', body: resultData });
  }

  async function loadBadges() {
    if (!isAuthenticated()) {
      return [];
    }
    return apiRequest('/badges');
  }

  async function loadFeedbackTemplate(type) {
    try {
      return await apiRequest(`/feedback/${encodeURIComponent(type)}`);
    } catch (error) {
      return null;
    }
  }

  function logout() {
    clearAuthToken();
    window.location.href = '/';
  }

  function updateNavbarAuth() {
    const navLinks = document.getElementById('navAuthLinks') || document.querySelector('.navbar-nav');
    if (!navLinks) return;

    let authItem = document.getElementById('authNavItem');
    if (!authItem) {
      authItem = document.createElement('li');
      authItem.className = 'nav-item';
      authItem.id = 'authNavItem';
      navLinks.appendChild(authItem);
    }

    const user = getStoredUser();
    if (isAuthenticated() && user) {
      authItem.innerHTML = `
        <div class="d-flex align-items-center gap-2">
          <a class="nav-link nav-link-custom" href="/views/profile">
            <i class="bi bi-person-circle me-1"></i> ${getDisplayName(user)}
          </a>
          <button class="btn btn-outline-custom btn-sm" type="button" onclick="window.NutriTECH.logout()">
            <i class="bi bi-box-arrow-right me-1"></i> Ieșire
          </button>
        </div>
      `;
    } else {
      authItem.innerHTML = `
        <button class="btn btn-outline-custom btn-sm ms-2" type="button" id="openAuthModalBtn">
          <i class="bi bi-box-arrow-in-right me-1"></i> Login / Înregistrare
        </button>
      `;
    }
  }

  function injectAuthModal() {
    if (document.getElementById('authModal')) return;

    const modalHtml = `
      <div class="modal fade" id="authModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content formula-modal">
            <div class="modal-header border-0">
              <div>
                <h4 class="font-title mb-1">Contul meu</h4>
                <p class="small mb-0 text-white-50">Conectează-te pentru a-ți salva profilul, jurnalul zilnic și rezultatele quiz-urilor.</p>
              </div>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Închide"></button>
            </div>
            <div class="modal-body">
              <ul class="nav nav-tabs border-0 mb-3" role="tablist">
                <li class="nav-item" role="presentation">
                  <button class="nav-link active" id="login-tab" data-bs-toggle="tab" data-bs-target="#loginPane" type="button" role="tab">Login</button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" id="register-tab" data-bs-toggle="tab" data-bs-target="#registerPane" type="button" role="tab">Înregistrare</button>
                </li>
              </ul>
              <div class="tab-content">
                <div class="tab-pane fade show active" id="loginPane" role="tabpanel">
                  <form id="loginForm" class="d-grid gap-2">
                    <input type="email" class="form-control form-control-custom" id="loginEmail" placeholder="Email" required>
                    <input type="password" class="form-control form-control-custom" id="loginPassword" placeholder="Parolă" required>
                    <button class="btn btn-primary-custom" type="submit">Conectează-mă</button>
                  </form>
                </div>
                <div class="tab-pane fade" id="registerPane" role="tabpanel">
                  <form id="registerForm" class="d-grid gap-2">
                    <input type="text" class="form-control form-control-custom" id="registerName" placeholder="Nume complet" required>
                    <input type="email" class="form-control form-control-custom" id="registerEmail" placeholder="Email" required>
                    <input type="password" class="form-control form-control-custom" id="registerPassword" placeholder="Parolă" required>
                    <button class="btn btn-outline-custom" type="submit">Creează cont</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  async function loadCurrentUser() {
    if (!isAuthenticated()) {
      return null;
    }

    try {
      const data = await apiRequest('/me');
      if (data && data.user) {
        setAuthToken(getAuthToken(), data.user);
        updateNavbarAuth();
        return data;
      }
    } catch (error) {
      clearAuthToken();
      updateNavbarAuth();
      return null;
    }
  }

  function bindAuthForms() {
    document.addEventListener('click', (event) => {
      const button = event.target.closest('#openAuthModalBtn');
      if (button) {
        const modal = new bootstrap.Modal(document.getElementById('authModal'));
        modal.show();
      }
    });

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
      loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        try {
          const data = await apiRequest('/login', { method: 'POST', body: { email, password } });
          setAuthToken(data.token, data.user);
          updateNavbarAuth();
          if (window.bootstrap) {
            bootstrap.Modal.getInstance(document.getElementById('authModal'))?.hide();
          }
          window.location.reload();
        } catch (error) {
          alert(error.message);
        }
      });
    }

    if (registerForm) {
      registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        try {
          const data = await apiRequest('/register', { method: 'POST', body: { name, email, password } });
          setAuthToken(data.token, data.user);
          updateNavbarAuth();
          if (window.bootstrap) {
            bootstrap.Modal.getInstance(document.getElementById('authModal'))?.hide();
          }
          window.location.reload();
        } catch (error) {
          alert(error.message);
        }
      });
    }
  }

  function initAuthUI() {
    injectAuthModal();
    updateNavbarAuth();
    bindAuthForms();
    loadCurrentUser();
  }

  window.NutriTECH = {
    apiRequest,
    getAuthToken,
    setAuthToken,
    clearAuthToken,
    isAuthenticated,
    getStoredUser,
    saveProfile,
    loadProfile,
    saveDailyLog,
    loadDailyLog,
    saveQuizResult,
    loadBadges,
    loadFeedbackTemplate,
    logout,
    loadCurrentUser,
    initAuthUI,
    getDisplayName,
    getTodayKey
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthUI);
  } else {
    initAuthUI();
  }
})();

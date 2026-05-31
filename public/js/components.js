(async function () {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  async function loadHTML(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Yüklenemedi: ' + url);
    return res.text();
  }

  function replacePlaceholder(id, html) {
    const el = document.getElementById(id);
    if (!el) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    el.replaceWith(...tmp.childNodes);
  }

  try {
    const [headerHTML, footerHTML] = await Promise.all([
      loadHTML('components/header.html'),
      loadHTML('components/footer.html')
    ]);
    replacePlaceholder('header-placeholder', headerHTML);
    replacePlaceholder('footer-placeholder', footerHTML);
  } catch (e) {
    console.error('Bileşen yükleme hatası:', e);
    return;
  }

  // Aktif sayfayı işaretle
  const pageMap = {
    'index.html': 'index',
    '': 'index',
    'events.html': 'events',
    'event-detail.html': 'events',
    'admin.html': 'admin',
    'login.html': 'login',
    'register.html': 'register',
    'profile.html': 'profile',
    'kullanim-kosullari.html': '',
    'gizlilik-politikasi.html': '',
    'cerez-politikasi.html': ''
  };
  const activePage = pageMap[currentPage];
  if (activePage) {
    const activeEl = document.querySelector(`[data-page="${activePage}"]`);
    if (activeEl) activeEl.classList.add('active');
  }

  // Auth durumunu uygula (auth.js'ten)
  if (typeof updateNavbar === 'function') updateNavbar();

  // Footer giriş linklerini güncelle
  const loggedIn = typeof isLoggedIn === 'function' && isLoggedIn();
  const footerLogin = document.getElementById('footer-login-link');
  const footerRegister = document.getElementById('footer-register-link');
  const footerProfile = document.getElementById('footer-profile-link');
  const footerAdmin = document.getElementById('footer-admin-link');
  if (loggedIn) {
    if (footerLogin) footerLogin.classList.add('hidden');
    if (footerRegister) footerRegister.classList.add('hidden');
    if (footerProfile) footerProfile.classList.remove('hidden');
    if (footerAdmin && typeof isAdmin === 'function' && isAdmin()) {
      footerAdmin.classList.remove('hidden');
    }
  }

  // Nav-links top'unu header gerçek yüksekliğine eşitle (hardcoded 70px yerine)
  const header = document.querySelector('header');
  const navLinks = document.querySelector('.nav-links');
  function syncNavTop() {
    if (header && navLinks) {
      navLinks.style.top = header.offsetHeight + 'px';
    }
  }
  syncNavTop();
  window.addEventListener('resize', syncNavTop);

  // Hamburger menü
  const hamburger = document.querySelector('.hamburger');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }

  // Çıkış butonu
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn && typeof logout === 'function') {
    logoutBtn.addEventListener('click', logout);
  }
})();

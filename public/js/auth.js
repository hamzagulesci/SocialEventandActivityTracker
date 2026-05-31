// Kimlik doğrulama ile ilgili fonksiyonlar
const API_URL = window.location.origin + '/api';

// Kullanıcının giriş yapıp yapmadığını kontrol et
function isLoggedIn() {
  return localStorage.getItem('token') !== null;
}

// Token'ı al
function getToken() {
  return localStorage.getItem('token');
}

// Mevcut kullanıcıyı al
function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Kimlik doğrulama token'ını header'a ekle
function setAuthHeader() {
  const token = getToken();
  if (token) {
    return {
      'Content-Type': 'application/json',
      'x-auth-token': token
    };
  }
  return {
    'Content-Type': 'application/json'
  };
}

// Kullanıcı çıkışı yap
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// Kullanıcının admin olup olmadığını kontrol et
function isAdmin() {
  const user = getCurrentUser();
  return user && (user.isAdmin === 1 || user.isAdmin === 2);
}

// Kullanıcının giriş yapıp yapmadığını ve admin olup olmadığını kontrol et
function checkAdminAccess() {
  if (!isLoggedIn() || !isAdmin()) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

// Navigasyon çubuğunu kimlik durumuna göre güncelle
function updateNavbar() {
  const authLinks = document.getElementById('auth-links');
  const userProfile = document.getElementById('user-profile');
  const userName = document.getElementById('user-name');
  const userAvatar = document.getElementById('user-avatar');
  const adminLink = document.querySelector('a[href="admin.html"]');
  const adminNavItem = adminLink ? adminLink.closest('li') : null;

  // Sayfanın hangisi olduğunu belirle
  const currentPage = window.location.pathname.split('/').pop();

  if (isLoggedIn()) {
    if (authLinks) authLinks.classList.add('hidden');
    if (userProfile) {
      userProfile.classList.remove('hidden');
      const user = getCurrentUser();
      if (userName && user) {
        userName.textContent = `Merhaba, ${user.name}`;
      }
      if (userAvatar && user) {
        userAvatar.src = user.avatar;
      }
    }

    // Admin sayfasına erişim kontrolü
    if (currentPage === 'admin.html' && !isAdmin()) {
      alert('Bu sayfaya erişim için admin yetkiniz bulunmamaktadır!');
      window.location.href = 'index.html';
      return;
    }

    // Admin linki kontrolü (admin.html sayfasında link zaten görünür)
    if (adminNavItem && currentPage !== 'admin.html') {
      if (isAdmin()) {
        adminNavItem.classList.remove('hidden');
      } else {
        adminNavItem.classList.add('hidden');
      }
    }
  } else {
    if (authLinks) authLinks.classList.remove('hidden');
    if (userProfile) userProfile.classList.add('hidden');
    if (adminNavItem && currentPage !== 'admin.html') adminNavItem.classList.add('hidden');

    // Korumalı sayfada ise yönlendir
    if (currentPage === 'profile.html' || currentPage === 'admin.html') {
      window.location.href = 'login.html';
    }
  }
}

// Hamburger, logout ve updateNavbar kurulumu components.js tarafından
// header/footer yüklendikten sonra yapılır.

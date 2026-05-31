/**
 * Admin Paneli JavaScript Kodları
 * Bu dosya, admin panelindeki işlevleri yönetir:
 * - Etkinlik ekleme, düzenleme, silme
 * - Sekme değiştirme
 * - Kullanıcı yönetimi
 */

// Admin erişim kontrolü - isAdmin değeri 1 veya 2 olanlar için
// Sayfanın en başında çalışmalı
if (typeof checkAdminAccess === 'function') {
  checkAdminAccess();
} else {
  window.location.href = 'index.html';
}

// Sayfa tamamen yüklendiğinde çalışacak kodlar
document.addEventListener('DOMContentLoaded', () => {
  // ===== DOM Elemanlarının Seçilmesi =====
  // Admin sekmeleri
  const adminTabs = document.querySelectorAll('.admin-tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  // Etkinlik yönetimi ile ilgili elemanlar
  const addEventBtn = document.getElementById('add-event-btn');
  const eventFormContainer = document.getElementById('event-form-container');
  const eventForm = document.getElementById('event-form');
  const cancelEventBtn = document.getElementById('cancel-event-btn');
  const formTitle = document.getElementById('form-title');
  const eventsList = document.getElementById('events-list');
  const formMessage = document.getElementById('form-message');
  const searchEvents = document.getElementById('search-events');
  const eventsPagination = document.getElementById('events-pagination');
  
  // Form elemanları
  const eventIdInput = document.getElementById('event-id');
  const eventTitleInput = document.getElementById('event-title');
  const eventCategoryInput = document.getElementById('event-category');
  const eventDateInput = document.getElementById('event-date');
  const eventTimeInput = document.getElementById('event-time');
  const eventLocationInput = document.getElementById('event-location');
  const eventLimitInput = document.getElementById('event-limit');
  const eventImageInput = document.getElementById('event-image');
  const eventDescriptionInput = document.getElementById('event-description');
  
  // ===== DOM Elemanları (Kullanıcılar için) =====
  const searchUsers = document.getElementById('search-users');
  const usersList = document.getElementById('users-list');
  const usersPagination = document.getElementById('users-pagination');
  
  // ===== Değişkenler =====
  let allEvents = []; // Tüm etkinlikleri saklamak için dizi
  let currentPage = 1; // Mevcut sayfa
  let itemsPerPage = 10; // Sayfa başına öğe sayısı
  let isEditing = false; // Düzenleme modu kontrolü
  
  // ===== Değişkenler (Kullanıcılar için) =====
  let allUsers = []; // Tüm kullanıcıları saklamak için dizi
  let usersCurrentPage = 1; // Kullanıcılar için mevcut sayfa
  
  // ===== Sekme Değiştirme İşlevi =====
  adminTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Aktif sekmeyi değiştir
      adminTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // İlgili içeriği göster
      const tabId = tab.getAttribute('data-tab');
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `tab-${tabId}`) {
          content.classList.add('active');
        }
      });
      
      // Eğer kullanıcılar sekmesine geçildiyse, kullanıcıları yükle
      if (tabId === 'users' && allUsers.length === 0) {
        fetchUsers();
      }
    });
  });
  
  // ===== Etkinlikleri Getiren Fonksiyon =====
  async function fetchEvents() {
    try {
      // Yükleniyor göstergesini göster
      eventsList.innerHTML = '<div class="loading-spinner"></div>';
      
      // API'ye istek at
      const response = await fetch('/api/events', {
        headers: setAuthHeader()
      });
      
      // Hata kontrolü
      if (!response.ok) {
        throw new Error('Etkinlikler getirilirken hata oluştu');
      }
      
      // Yanıtı JSON'a dönüştür
      const events = await response.json();
      
      // Tüm etkinlikleri global değişkene kaydet
      allEvents = events;
      
      // Etkinlikleri görüntüle
      displayEvents(events);
      
    } catch (error) {
      console.error('Etkinlikler yüklenirken hata:', error);
      eventsList.innerHTML = '<p class="error">Etkinlikler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.</p>';
    }
  }
  
  // ===== Etkinlikleri Görüntüleyen Fonksiyon =====
  function displayEvents(events, page = 1) {
    // Sayfalama için etkinlikleri böl
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedEvents = events.slice(start, end);
    
    // Etkinlik listesini temizle
    eventsList.innerHTML = '';
    
    // Eğer hiç etkinlik yoksa mesaj göster
    if (events.length === 0) {
      eventsList.innerHTML = '<p>Henüz etkinlik bulunmuyor.</p>';
      eventsPagination.innerHTML = '';
      return;
    }
    
    // Her etkinlik için bir liste öğesi oluştur
    paginatedEvents.forEach(event => {
      // Etkinlik tarihini formatlı şekilde hazırla
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      const formattedTime = eventDate.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Etkinlik listesi öğesini oluştur
      const eventItem = document.createElement('div');
      eventItem.className = 'event-item';
      eventItem.innerHTML = `
        <div class="event-item-info">
          <h3 class="event-item-title">${event.title}</h3>
          <div class="event-item-meta">
            <span><i class="fas fa-calendar"></i> ${formattedDate} ${formattedTime}</span> | 
            <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span> | 
            <span><i class="fas fa-tag"></i> ${event.category}</span>
          </div>
        </div>
        <div class="event-item-actions">
          <button class="btn-action btn-edit" data-id="${event._id}">
            <i class="fas fa-edit"></i> Düzenle
          </button>
          <button class="btn-action btn-delete" data-id="${event._id}">
            <i class="fas fa-trash-alt"></i> Sil
          </button>
        </div>
      `;
      
      // Oluşturulan öğeyi listeye ekle
      eventsList.appendChild(eventItem);
      
      // Düzenleme butonuna tıklama olayı ekle
      const editBtn = eventItem.querySelector('.btn-edit');
      editBtn.addEventListener('click', () => {
        populateForm(event);
      });
      
      // Silme butonuna tıklama olayı ekle
      const deleteBtn = eventItem.querySelector('.btn-delete');
      deleteBtn.addEventListener('click', () => {
        if (confirm(`"${event.title}" etkinliğini silmek istediğinize emin misiniz?`)) {
          deleteEvent(event._id);
        }
      });
    });
    
    // Sayfalama oluştur
    createPagination(events.length, page);
  }
  
  // ===== Sayfalama Oluşturma Fonksiyonu =====
  function createPagination(totalItems, currentPage) {
    // Toplam sayfa sayısını hesapla
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Eğer tek sayfa varsa sayfalama gösterme
    if (totalPages <= 1) {
      eventsPagination.innerHTML = '';
      return;
    }
    
    // Sayfalama HTML'ini oluştur
    let paginationHTML = '';
    
    // İlk sayfa
    paginationHTML += `<div class="pagination-item ${currentPage === 1 ? 'disabled' : ''}" data-page="1">İlk</div>`;
    
    // Önceki sayfa
    paginationHTML += `<div class="pagination-item ${currentPage === 1 ? 'disabled' : ''}" data-page="${currentPage - 1}">«</div>`;
    
    // Sayfa numaraları
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `<div class="pagination-item ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</div>`;
    }
    
    // Sonraki sayfa
    paginationHTML += `<div class="pagination-item ${currentPage === totalPages ? 'disabled' : ''}" data-page="${currentPage + 1}">»</div>`;
    
    // Son sayfa
    paginationHTML += `<div class="pagination-item ${currentPage === totalPages ? 'disabled' : ''}" data-page="${totalPages}">Son</div>`;
    
    // HTML'i sayfaya ekle
    eventsPagination.innerHTML = paginationHTML;
    
    // Sayfalama butonlarına olay dinleyicileri ekle
    const paginationItems = eventsPagination.querySelectorAll('.pagination-item');
    paginationItems.forEach(item => {
      if (!item.classList.contains('disabled')) {
        item.addEventListener('click', () => {
          const page = parseInt(item.getAttribute('data-page'));
          displayEvents(allEvents, page);
        });
      }
    });
  }
  
  // ===== Etkinlik Formunu Temizleme Fonksiyonu =====
  function clearForm() {
    eventIdInput.value = '';
    eventTitleInput.value = '';
    eventCategoryInput.value = '';
    eventDateInput.value = '';
    eventTimeInput.value = '';
    eventLocationInput.value = '';
    eventLimitInput.value = '';
    eventImageInput.value = '';
    eventDescriptionInput.value = '';
    isEditing = false;
  }
  
  // ===== Formu Etkinlik Bilgileriyle Doldurma Fonksiyonu =====
  function populateForm(event) {
    // Formu göster
    eventFormContainer.classList.remove('hidden');
    formTitle.textContent = 'Etkinliği Düzenle';
    
    // Etkinlik tarihini parçalara ayır
    const eventDate = new Date(event.date);
    const dateString = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD formatı
    const timeString = eventDate.toTimeString().slice(0, 5); // HH:MM formatı
    
    // Form alanlarını doldur
    eventIdInput.value = event._id;
    eventTitleInput.value = event.title;
    eventCategoryInput.value = event.category;
    eventDateInput.value = dateString;
    eventTimeInput.value = timeString;
    eventLocationInput.value = event.location;
    eventLimitInput.value = event.participantLimit;
    eventImageInput.value = event.image;
    eventDescriptionInput.value = event.description;
    
    // Düzenleme modunu aktifleştir
    isEditing = true;
    
    // Sayfayı form alanına kaydır
    eventFormContainer.scrollIntoView({ behavior: 'smooth' });
  }
  
  // ===== Yeni Etkinlik Ekleme/Güncelleme Fonksiyonu =====
  async function saveEvent(formData) {
    try {
      // İstek için gerekli URL ve metod
      const url = isEditing 
        ? `/api/events/${eventIdInput.value}` 
        : `/api/events`;
      const method = isEditing ? 'PUT' : 'POST';
      
      // API isteği
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...setAuthHeader()
        },
        body: JSON.stringify(formData)
      });
      
      // Hata kontrolü
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Etkinlik kaydedilirken bir hata oluştu');
      }
      
      // Başarılı yanıt
      const data = await response.json();
      
      // Başarı mesajı göster
      showMessage(
        isEditing 
          ? 'Etkinlik başarıyla güncellendi' 
          : 'Yeni etkinlik başarıyla eklendi', 
        'success'
      );
      
      // Formu temizle ve gizle
      clearForm();
      eventFormContainer.classList.add('hidden');
      
      // Etkinlikleri yeniden yükle
      fetchEvents();
      
    } catch (error) {
      console.error('Etkinlik kaydedilirken hata:', error);
      showMessage(error.message || 'Bir hata oluştu, lütfen tekrar deneyin', 'error');
    }
  }
  
  // ===== Etkinlik Silme Fonksiyonu =====
  async function deleteEvent(eventId) {
    try {
      // Yükleniyor mesajı göster
      showMessage('Etkinlik siliniyor...', 'info');
      
      // API isteği
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: setAuthHeader()
      });
      
      // Hata kontrolü
      if (!response.ok) {
        console.error('Etkinlik silme hata durumu:', response.status, response.statusText);
        let errorMessage = 'Etkinlik silinirken bir hata oluştu';
        
        try {
          // JSON hata mesajı almaya çalış
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // JSON alınamıyorsa HTTP durumunu kullan
          errorMessage = `Etkinlik silinirken hata: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      // Başarı mesajı göster
      showMessage('Etkinlik başarıyla silindi', 'success');
      
      // Etkinlikleri yeniden yükle
      fetchEvents();
      
    } catch (error) {
      console.error('Etkinlik silinirken hata:', error);
      showMessage(error.message || 'Bir hata oluştu, lütfen tekrar deneyin', 'error');
    }
  }
  
  // ===== Mesaj Gösterme Fonksiyonu =====
  function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    
    // 3 saniye sonra mesajı gizle
    setTimeout(() => {
      formMessage.className = 'form-message hidden';
    }, 3000);
  }
  
  // ===== Etkinlik Arama Fonksiyonu =====
  function searchEventsByKeyword(keyword) {
    if (!keyword || keyword.trim() === '') {
      displayEvents(allEvents);
      return;
    }
    
    // Anahtar kelimeyi normalizasyon için hazırla
    const normalizedKeyword = keyword.trim().toLowerCase();
    
    // Etkinlikleri filtrele
    const filteredEvents = allEvents.filter(event => {
      return (
        event.title.toLowerCase().includes(normalizedKeyword) ||
        event.description.toLowerCase().includes(normalizedKeyword) ||
        event.location.toLowerCase().includes(normalizedKeyword) ||
        event.category.toLowerCase().includes(normalizedKeyword)
      );
    });
    
    // Filtrelenmiş etkinlikleri göster
    displayEvents(filteredEvents);
  }
  
  // ===== Olay Dinleyicileri =====
  
  // Yeni Etkinlik Ekle butonuna tıklandığında
  addEventBtn.addEventListener('click', () => {
    // Etkinlikler sekmesine geç
    adminTabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    document.querySelector('.admin-tab[data-tab="events"]').classList.add('active');
    document.getElementById('tab-events').classList.add('active');

    clearForm();
    formTitle.textContent = 'Yeni Etkinlik Ekle';
    eventFormContainer.classList.remove('hidden');
    eventFormContainer.scrollIntoView({ behavior: 'smooth' });
  });
  
  // İptal butonuna tıklandığında
  cancelEventBtn.addEventListener('click', () => {
    clearForm();
    eventFormContainer.classList.add('hidden');
  });
  
  // ===== Etkinlik Formunu Doğrulama ve Kaydetme =====
  eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Görsel URL doğrulama
    const imageUrl = eventImageInput.value.trim();
    if (imageUrl && !imageUrl.startsWith('https://i.postimg.cc/')) {
      showMessage('Görsel URL\'si https://i.postimg.cc/ ile başlamalıdır', 'error');
      eventImageInput.focus();
      return;
    }
    
    // Form verilerini topla
    const date = new Date(`${eventDateInput.value}T${eventTimeInput.value}`);
    
    const formData = {
      title: eventTitleInput.value,
      category: eventCategoryInput.value,
      date: date.toISOString(),
      location: eventLocationInput.value,
      participantLimit: parseInt(eventLimitInput.value),
      image: imageUrl || 'default-event.jpg',
      description: eventDescriptionInput.value
    };
    
    // Etkinliği kaydet
    saveEvent(formData);
  });
  
  // Arama kutusuna yazıldığında
  searchEvents.addEventListener('input', debounce((e) => {
    searchEventsByKeyword(e.target.value);
  }, 300));
  
  // ===== Yardımcı Fonksiyonlar =====
  
  // Debounce fonksiyonu (art arda gelen olayları sınırlamak için)
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
  
  // HTML özel karakterleri dönüştürme fonksiyonu (XSS güvenliği için)
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  // Sayfalama için diziyi bölen fonksiyon
  function paginateArray(array, currentPage, itemsPerPage) {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return array.slice(start, end);
  }
  
  // ===== Kullanıcıları Getiren Fonksiyon =====
  async function fetchUsers() {
    try {
      // Yükleniyor göstergesini göster
      usersList.innerHTML = '<div class="loading-spinner"></div>';
      
      // Token kontrolü
      const token = getToken();
      if (!token) {
        usersList.innerHTML = '<p class="error">Oturum açık değil veya oturumunuz sona ermiş. Lütfen tekrar giriş yapın.</p>';
        return;
      }
      
      // API'ye istek at
      const response = await fetch('/api/users', {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      // Hata kontrolü
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Hata kodu: ${response.status}` }));
        
        if (response.status === 403) {
          usersList.innerHTML = '<p class="error">Bu işlem için yeterli yetkiye sahip değilsiniz. Admin yetkisi gereklidir.</p>';
        } else {
          throw new Error(errorData.message || 'Kullanıcılar getirilirken hata oluştu');
        }
        return;
      }
      
      // Yanıtı JSON'a dönüştür
      const users = await response.json();
      
      // Tüm kullanıcıları global değişkene kaydet
      allUsers = users;
      
      // Kullanıcıları görüntüle
      displayUsers(users);
      
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
      usersList.innerHTML = `<p class="error">Kullanıcılar yüklenirken bir hata oluştu: ${error.message}</p>`;
    }
  }
  
  // ===== Kullanıcıları Görüntüleyen Fonksiyon =====
  function displayUsers(users) {
    // Sayfalama için kullanıcıları böl
    const start = (usersCurrentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedUsers = users.slice(start, end);
    
    // Kullanıcı listesini temizle
    usersList.innerHTML = '';
    
    // Eğer hiç kullanıcı yoksa mesaj göster
    if (users.length === 0) {
      usersList.innerHTML = '<p>Henüz kullanıcı bulunmuyor.</p>';
      usersPagination.innerHTML = '';
      return;
    }
    
    // Mevcut kullanıcı bilgilerini al (owner kontrolü için)
    const currentUser = getCurrentUser();
    const isOwner = currentUser && currentUser.isAdmin === 2;
    
    // Her kullanıcı için bir liste öğesi oluştur
    paginatedUsers.forEach(user => {
      const createdDate = new Date(user.createdAt);
      const formattedDate = createdDate.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      // Kullanıcı avatarı
      const avatarSrc = user.avatar ? user.avatar : 'avatar/default-avatar.png';
      
      // Admin rozeti
      let adminBadge = '';
      if (user.isAdmin === 2) {
        adminBadge = '<span class="admin-badge" style="background-color: #9c27b0;">Owner</span>';
      } else if (user.isAdmin === 1) {
        adminBadge = '<span class="admin-badge">Admin</span>';
      }
      
      // Kullanıcı listesi öğesini oluştur
      const userItem = document.createElement('div');
      userItem.className = 'user-item';
      userItem.innerHTML = `
        <div class="user-item-info">
          <img src="${avatarSrc}" alt="${user.name}" class="user-avatar">
          <div class="user-item-details">
            <h3>${user.name} ${adminBadge}</h3>
            <p>${user.email}</p>
            <p><small>Kayıt: ${formattedDate}</small></p>
          </div>
        </div>
        <div class="user-item-actions">
          ${user.isAdmin === 0 ? 
            `<button class="btn-action btn-make-admin" data-id="${user._id}">
              <i class="fas fa-user-shield"></i> Admin Yap
            </button>` : 
            (user._id !== currentUser.id && user.isAdmin !== 2 ? 
              `<button class="btn-action btn-revoke-admin" data-id="${user._id}">
                <i class="fas fa-user-slash"></i> Admin Yetkisini Al
              </button>` : '')
          }
          ${isOwner && user._id !== currentUser.id && user.isAdmin !== 2 ? 
            `<button class="btn-action btn-delete btn-delete-user" data-id="${user._id}" data-name="${user.name}">
              <i class="fas fa-trash-alt"></i> Sil
            </button>` : ''
          }
        </div>
      `;
      
      // Oluşturulan öğeyi listeye ekle
      usersList.appendChild(userItem);
      
      // Admin yapma butonuna tıklama olayı ekle
      const makeAdminBtn = userItem.querySelector('.btn-make-admin');
      if (makeAdminBtn) {
        makeAdminBtn.addEventListener('click', () => {
          if (confirm(`"${user.name}" kullanıcısını admin yapmak istediğinize emin misiniz?`)) {
            makeUserAdmin(user._id);
          }
        });
      }
      
      // Admin yetkisini alma butonuna tıklama olayı ekle
      const revokeAdminBtn = userItem.querySelector('.btn-revoke-admin');
      if (revokeAdminBtn) {
        revokeAdminBtn.addEventListener('click', () => {
          if (confirm(`"${user.name}" kullanıcısının admin yetkisini almak istediğinize emin misiniz?`)) {
            revokeUserAdmin(user._id);
          }
        });
      }
      
      // Kullanıcı silme butonuna tıklama olayı ekle
      const deleteUserBtn = userItem.querySelector('.btn-delete-user');
      if (deleteUserBtn) {
        deleteUserBtn.addEventListener('click', () => {
          if (confirm(`"${user.name}" kullanıcısını silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)) {
            deleteUser(user._id, user.name);
          }
        });
      }
    });
    
    // Sayfalama oluştur
    createUsersPagination(users.length, usersCurrentPage);
  }
  
  // ===== Kullanıcı Sayfalama Oluşturma Fonksiyonu =====
  function createUsersPagination(totalItems, currentPage) {
    // Toplam sayfa sayısını hesapla
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Eğer tek sayfa varsa sayfalama gösterme
    if (totalPages <= 1) {
      usersPagination.innerHTML = '';
      return;
    }
    
    // Sayfalama HTML'ini oluştur
    let paginationHTML = '';
    
    // İlk sayfa
    paginationHTML += `<div class="pagination-item ${currentPage === 1 ? 'disabled' : ''}" data-page="1">İlk</div>`;
    
    // Önceki sayfa
    paginationHTML += `<div class="pagination-item ${currentPage === 1 ? 'disabled' : ''}" data-page="${currentPage - 1}">«</div>`;
    
    // Sayfa numaraları
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `<div class="pagination-item ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</div>`;
    }
    
    // Sonraki sayfa
    paginationHTML += `<div class="pagination-item ${currentPage === totalPages ? 'disabled' : ''}" data-page="${currentPage + 1}">»</div>`;
    
    // Son sayfa
    paginationHTML += `<div class="pagination-item ${currentPage === totalPages ? 'disabled' : ''}" data-page="${totalPages}">Son</div>`;
    
    // HTML'i sayfaya ekle
    usersPagination.innerHTML = paginationHTML;
    
    // Sayfalama butonlarına olay dinleyicileri ekle
    const paginationItems = usersPagination.querySelectorAll('.pagination-item');
    paginationItems.forEach(item => {
      if (!item.classList.contains('disabled')) {
        item.addEventListener('click', () => {
          const page = parseInt(item.getAttribute('data-page'));
          usersCurrentPage = page;
          displayUsers(allUsers);
        });
      }
    });
  }
  
  // ===== Kullanıcıyı Admin Yapma Fonksiyonu =====
  async function makeUserAdmin(userId) {
    try {
      // API isteği
      const response = await fetch(`/api/users/${userId}/make-admin`, {
        method: 'PUT',
        headers: setAuthHeader()
      });
      
      // Hata kontrolü
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kullanıcı admin yapılırken bir hata oluştu');
      }
      
      // Başarılı yanıt
      const data = await response.json();
      
      // Başarı mesajı göster
      showMessage('Kullanıcı başarıyla admin yapıldı', 'success');
      
      // Kullanıcıları yeniden yükle
      fetchUsers();
      
    } catch (error) {
      console.error('Kullanıcı admin yapılırken hata:', error);
      showMessage(error.message || 'Bir hata oluştu, lütfen tekrar deneyin', 'error');
    }
  }
  
  // ===== Kullanıcının Admin Yetkisini Alma Fonksiyonu =====
  async function revokeUserAdmin(userId) {
    try {
      // Yükleniyor mesajı göster
      showMessage('İşlem yapılıyor...', 'info');
      
      // API isteği
      const response = await fetch(`/api/users/${userId}/revoke-admin`, {
        method: 'PUT',
        headers: setAuthHeader()
      });
      
      // Hata kontrolü
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Admin yetkisi alınırken bir hata oluştu');
      }
      
      // Başarılı yanıt
      const data = await response.json();
      
      // Başarı mesajı göster
      showMessage('Kullanıcının admin yetkisi başarıyla alındı', 'success');
      
      // Kullanıcıları yeniden yükle
      fetchUsers();
      
    } catch (error) {
      console.error('Admin yetkisi alınırken hata:', error);
      showMessage(error.message || 'Bir hata oluştu, lütfen tekrar deneyin', 'error');
    }
  }
  
  // ===== Kullanıcı Arama Fonksiyonu =====
  function searchUsersByKeyword(keyword) {
    if (!keyword || keyword.trim() === '') {
      displayUsers(allUsers);
      return;
    }
    
    // Anahtar kelimeyi normalizasyon için hazırla
    const normalizedKeyword = keyword.trim().toLowerCase();
    
    // Kullanıcıları filtrele
    const filteredUsers = allUsers.filter(user => {
      return (
        user.name.toLowerCase().includes(normalizedKeyword) ||
        user.email.toLowerCase().includes(normalizedKeyword)
      );
    });
    
    // Filtrelenmiş kullanıcıları göster
    displayUsers(filteredUsers);
  }
  
  // ===== Kullanıcı Silme Fonksiyonu =====
  async function deleteUser(userId, userName) {
    try {
      // Yükleniyor mesajı göster
      showMessage('Kullanıcı siliniyor...', 'info');
      
      // API isteği
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: setAuthHeader()
      });
      
      // Yanıtın içeriğini al
      const result = await response.json();
      
      // Hata kontrolü
      if (!response.ok) {
        console.error("API Yanıt hatası:", {
          status: response.status,
          message: result.message
        });
        
        if (response.status === 403) {
          showMessage('Bu işlem için owner yetkisine sahip olmalısınız', 'error');
        } else {
          showMessage(result.message || 'Kullanıcı silinirken bir hata oluştu', 'error');
        }
        return;
      }
      
      // Başarı mesajı göster
      showMessage(`"${userName}" kullanıcısı başarıyla silindi`, 'success');
      
      // Kullanıcı listesini yenile
      fetchUsers();
      
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error);
      showMessage(error.message || 'Bir hata oluştu, lütfen tekrar deneyin', 'error');
    }
  }
  
  // ===== Sayfa Yüklendiğinde =====
  fetchEvents();

  // Kullanıcı arama kutusuna yazıldığında
  if (searchUsers) {
    searchUsers.addEventListener('input', debounce((e) => {
      searchUsersByKeyword(e.target.value);
    }, 300));
  }
}); 
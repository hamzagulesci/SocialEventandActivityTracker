// Profil sayfası JavaScript kodları
document.addEventListener('DOMContentLoaded', () => {
  const profileName = document.getElementById('profile-name');
  const profileNameValue = document.getElementById('profile-name-value');
  const profileEmail = document.getElementById('profile-email');
  const joinedEvents = document.getElementById('joined-events');
  const editProfileBtn = document.getElementById('edit-profile-btn');
  const profileDetails = document.getElementById('profile-details');
  const profileEditForm = document.getElementById('profile-edit-form');
  const editForm = document.getElementById('edit-form');
  const editName = document.getElementById('edit-name');
  const editEmail = document.getElementById('edit-email');
  const cancelEditBtn = document.getElementById('cancel-edit');
  const avatarEditBtn = document.getElementById('avatar-edit-btn');
  const avatarSelectionPanel = document.getElementById('avatar-selection-panel');
  const saveAvatarBtn = document.getElementById('save-avatar');
  const cancelAvatarBtn = document.getElementById('cancel-avatar');
  const profileTabs = document.querySelectorAll('.profile-tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  // API URL'ı auth.js dosyasında global olarak tanımlanmıştır, burada tekrar tanımlamaya gerek yok
  
  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  if (!isLoggedIn()) {
    window.location.href = 'login.html?redirect=profile.html';
    return;
  }
  
  // Tab değiştirme işlevi
  profileTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Aktif tab'ı değiştir
      profileTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // İlgili içeriği göster
      const tabId = tab.getAttribute('data-tab');
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `tab-${tabId}`) {
          content.classList.add('active');
        }
      });
    });
  });
  
  // Kullanıcı bilgilerini getir ve göster
  async function fetchUserProfile() {
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: setAuthHeader()
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 404) {
          window.location.href = 'login.html';
          return;
        }
        throw new Error('Kullanıcı bilgileri alınamadı');
      }

      const user = await response.json();

      // Kullanıcı bilgilerini göster
      profileName.textContent = user.name;
      profileNameValue.textContent = user.name;
      profileEmail.textContent = user.email;
      
      // Form alanlarını doldur
      editName.value = user.name;
      editEmail.value = user.email;
      
      // Mevcut avatarı göster (eğer avatar özelliği varsa)
      if (user.avatar) {
        document.getElementById('current-avatar').src = user.avatar;
      }
      
      return user;
    } catch (err) {
      console.error('Kullanıcı bilgileri yüklenirken hata:', err);
      alert('Kullanıcı bilgileri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  }
  
  // Kullanıcının katıldığı etkinlikleri getir
  async function fetchJoinedEvents() {
    try {
      const response = await fetch(`${API_URL}/users/me/events`, {
        headers: setAuthHeader()
      });
      
      const events = await response.json();
      
      // Etkinlikleri göster
      displayJoinedEvents(events);
      
      // Yükleniyor mesajını kaldır
      const loadingElement = joinedEvents.querySelector('.loading');
      if (loadingElement) {
        loadingElement.remove();
      }
    } catch (err) {
      console.error('Katılınan etkinlikler yüklenirken hata oluştu:', err);
      joinedEvents.innerHTML = '<p class="error">Etkinlikler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>';
    }
  }
  
  // Katılınan etkinlikleri göster
  function displayJoinedEvents(events) {
    if (events.length === 0) {
      joinedEvents.innerHTML = '<p>Henüz bir etkinliğe katılmadınız.</p>';
      return;
    }
    
    joinedEvents.innerHTML = '';
    
    events.forEach(event => {
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
      
      const eventCard = document.createElement('div');
      eventCard.className = 'event-card';
      eventCard.innerHTML = `
        <div class="event-image">
          <img src="${event.image}" alt="${event.title}">
        </div>
        <div class="event-info">
          <h3>${event.title}</h3>
          <div class="event-meta">
            <p><i class="fas fa-calendar"></i> ${formattedDate}</p>
            <p><i class="fas fa-clock"></i> ${formattedTime}</p>
            <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
          </div>
          <p class="event-description">${event.description.substring(0, 100)}${event.description.length > 100 ? '...' : ''}</p>
          <a href="event-detail.html?id=${event._id}" class="btn">Detaylar</a>
        </div>
      `;
      
      joinedEvents.appendChild(eventCard);
    });
  }
  
  // Avatar yönetimi için gerekli değişkenler
  const avatarGrid = document.getElementById('avatar-options');
  const currentAvatar = document.getElementById('current-avatar');
  const AVATAR_COUNT = 20; // Toplam avatar sayısı
  let selectedAvatarPath = currentAvatar.src; // Şu anki seçili avatar
  
  // Avatar seçeneklerini oluştur
  function createAvatarOptions() {
    // Avatar grid'ini temizle
    avatarGrid.innerHTML = '';
    
    // Avatar seçeneklerini oluştur
    for (let i = 1; i <= AVATAR_COUNT; i++) {
      const avatarNumber = i.toString().padStart(2, '0');
      const avatarPath = `avatar/avatar_${avatarNumber}.png`;
      
      const avatarElement = document.createElement('img');
      avatarElement.src = avatarPath;
      avatarElement.alt = `Avatar ${i}`;
      avatarElement.className = 'avatar-option';
      
      // Mevcut avatar seçili olsun
      if (avatarPath === currentAvatar.src.split('/').slice(-2).join('/')) {
        avatarElement.classList.add('selected');
      }
      
      // Avatar seçildiğinde
      avatarElement.addEventListener('click', () => {
        // Geçici olarak seçilen avatarı güncelle
        selectedAvatarPath = avatarPath;
        
        // Tüm avatar seçeneklerinden 'selected' sınıfını kaldır
        document.querySelectorAll('.avatar-option').forEach(avatar => {
          avatar.classList.remove('selected');
        });
        
        // Seçili avatara 'selected' sınıfını ekle
        avatarElement.classList.add('selected');
      });
      
      avatarGrid.appendChild(avatarElement);
    }
  }
  
  // Avatar seçme butonu tıklandığında
  avatarEditBtn.addEventListener('click', () => {
    createAvatarOptions();
    profileDetails.style.display = 'none';
    profileEditForm.style.display = 'none';
    avatarSelectionPanel.style.display = 'block';
  });
  
  // Avatar seçimi iptal edildiğinde
  cancelAvatarBtn.addEventListener('click', () => {
    avatarSelectionPanel.style.display = 'none';
    profileDetails.style.display = 'block';
  });
  
  // Avatar kaydedildiğinde
  saveAvatarBtn.addEventListener('click', async () => {
    try {
      const response = await fetch(`${API_URL}/users/avatar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...setAuthHeader()
        },
        body: JSON.stringify({ avatar: selectedAvatarPath })
      });
      
      if (!response.ok) {
        throw new Error('Avatar güncellenirken hata oluştu');
      }
      
      // Başarılı olursa avatarı güncelle
      currentAvatar.src = selectedAvatarPath;
      
      // Paneli kapat
      avatarSelectionPanel.style.display = 'none';
      profileDetails.style.display = 'block';
      
      // Başarı mesajı göster
      alert('Avatar başarıyla güncellendi');
      
    } catch (error) {
      console.error('Avatar seçilirken hata:', error);
      alert('Avatar güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  });
  
  // Profil düzenleme formunu aç
  editProfileBtn.addEventListener('click', () => {
    profileDetails.style.display = 'none';
    avatarSelectionPanel.style.display = 'none';
    profileEditForm.style.display = 'block';
  });
  
  // Profil düzenleme formunu kapat
  cancelEditBtn.addEventListener('click', () => {
    profileDetails.style.display = 'block';
    profileEditForm.style.display = 'none';
  });
  
  // Profil düzenleme formunu gönder
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
      const formData = {
        name: editName.value.trim(),
        email: editEmail.value.trim()
      };
      
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...setAuthHeader()
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Profil güncellenirken hata oluştu');
      }
      
      const updatedUser = await response.json();
      
      // Profil bilgilerini güncelle
      profileName.textContent = updatedUser.name;
      profileNameValue.textContent = updatedUser.name;
      profileEmail.textContent = updatedUser.email;
      
      // Formu kapat
      profileDetails.style.display = 'block';
      profileEditForm.style.display = 'none';
      
      // Başarı mesajı göster
      alert('Profil bilgileriniz başarıyla güncellendi');
      
    } catch (err) {
      console.error('Profil güncellenirken hata:', err);
      alert(err.message || 'Profil güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  });
  
  // Sayfa yüklendiğinde fonksiyonları çalıştır
  fetchUserProfile();
  fetchJoinedEvents();
});

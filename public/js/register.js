// Kayıt sayfası JavaScript kodları
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const errorMessage = document.getElementById('error-message');
  const avatarGrid = document.getElementById('register-avatar-options');
  const selectedAvatar = document.getElementById('selected-avatar');
  const avatarPathInput = document.getElementById('avatar-path');
  
  // Avatar seçeneklerini oluştur
  const AVATAR_COUNT = 20; // Toplam avatar sayısı
  
  function createAvatarOptions() {
    // Avatar grid'ini temizle
    if (!avatarGrid) return;
    
    avatarGrid.innerHTML = '';
    
    // Avatar seçeneklerini oluştur
    for (let i = 1; i <= AVATAR_COUNT; i++) {
      const avatarNumber = i.toString().padStart(2, '0');
      const avatarPath = `avatar/avatar_${avatarNumber}.png`;
      
      const avatarElement = document.createElement('img');
      avatarElement.src = avatarPath;
      avatarElement.alt = `Avatar ${i}`;
      avatarElement.className = 'avatar-option';
      
      // İlk avatar seçili olsun
      if (i === 1) {
        avatarElement.classList.add('selected');
      }
      
      // Avatar seçildiğinde
      avatarElement.addEventListener('click', () => {
        // Seçili avatar görselini güncelle
        if (selectedAvatar) {
          selectedAvatar.src = avatarPath;
        }
        
        // Hidden input alanına seçilen avatar yolunu kaydet
        if (avatarPathInput) {
          avatarPathInput.value = avatarPath;
        }
        
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
  
  // Sayfa yüklendiğinde avatar seçeneklerini oluştur
  createAvatarOptions();
  
  // Kayıt formu gönderildiğinde
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const password2 = document.getElementById('password2').value;
      const avatar = avatarPathInput ? avatarPathInput.value : 'avatar/avatar_01.png';
      
      if (!name || !email || !password || !password2) {
        showError('Lütfen tüm alanları doldurun.');
        return;
      }
      
      if (password !== password2) {
        showError('Şifreler eşleşmiyor.');
        return;
      }
      
      if (password.length < 6) {
        showError('Şifre en az 6 karakter olmalıdır.');
        return;
      }
      
      try {
        const response = await fetch(`${API_URL}/users/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, email, password, avatar })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Token ve kullanıcı bilgilerini localStorage'a kaydet
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Ana sayfaya yönlendir
          window.location.href = 'index.html';
        } else {
          showError(data.message || 'Kayıt olurken bir hata oluştu.');
        }
      } catch (err) {
        console.error('Kayıt olurken hata oluştu:', err);
        showError('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
    });
  }
  
  // Hata mesajını göster
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
  }
});

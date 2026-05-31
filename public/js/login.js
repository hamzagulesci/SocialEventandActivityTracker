// Login sayfası JavaScript kodları
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const messageDiv = document.getElementById('message');
  
  // Redirect parametresi varsa al
  const urlParams = new URLSearchParams(window.location.search);
  const redirect = urlParams.get('redirect');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Form verilerini al
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        // Yükleniyor mesajı göster
        displayMessage('Giriş yapılıyor...', 'info');
        
        // API isteği
        const response = await fetch(`${API_URL}/users/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
        
        // Hata kontrolü
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Giriş yaparken bir hata oluştu');
        }
        
        // Başarılı giriş
        const data = await response.json();
        
        // Kullanıcı bilgilerini ve token'ı kaydet
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Debug için kullanıcı bilgilerini konsola yazdır
        console.log('Oturum açıldı:', {
          id: data.user.id,
          name: data.user.name,
          isAdmin: data.user.isAdmin
        });
        
        // Anasayfaya yönlendir
        window.location.href = redirect || 'index.html';
        
      } catch (error) {
        // Hata mesajı göster
        displayMessage(error.message, 'error');
      }
    });
  }
  
  function displayMessage(message, type) {
    if (messageDiv) {
      messageDiv.textContent = message;
      messageDiv.className = type;
      messageDiv.style.display = 'block';
      
      // 5 saniye sonra mesajı gizle
      setTimeout(() => {
        messageDiv.style.display = 'none';
      }, 5000);
    }
  }
});

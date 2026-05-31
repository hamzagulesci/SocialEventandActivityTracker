/**
 * Şifre görünürlüğünü değiştiren JavaScript kodu
 * Bu kod, şifre alanlarında göz ikonuna tıklandığında şifrenin görünür/gizli olmasını sağlar
 */

document.addEventListener('DOMContentLoaded', function() {
    // Tüm şifre göster/gizle butonlarını seç
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    // Her buton için olay dinleyicisi ekle
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Butonun bulunduğu container'ı bul
            const container = this.closest('.password-input-container');
            
            // Container içindeki şifre alanını bul
            const passwordInput = container.querySelector('input');
            
            // Şifre alanının tipini değiştir (password <-> text)
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.innerHTML = '<i class="fas fa-eye-slash"></i>'; // Göz kapalı ikonu
            } else {
                passwordInput.type = 'password';
                this.innerHTML = '<i class="fas fa-eye"></i>'; // Göz açık ikonu
            }
        });
    });
});

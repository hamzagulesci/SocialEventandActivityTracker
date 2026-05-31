// Bu script kullanıcı yetkisini düzeltmek için kullanılır
// İşlem sonrası sayfayı yenileyin

(function() {
  // Mevcut kullanıcı bilgisini al
  const userDataRaw = localStorage.getItem('user');
  
  if (!userDataRaw) {
    console.error('Kullanıcı bilgisi bulunamadı. Lütfen önce giriş yapın.');
    alert('Kullanıcı bilgisi bulunamadı. Lütfen önce giriş yapın.');
    return;
  }
  
  try {
    // User verisini parse et
    const userData = JSON.parse(userDataRaw);
    
    // isAdmin değerini kontrol et
    if (userData.isAdmin === null || userData.isAdmin === undefined) {
      console.log('isAdmin değeri bulunamadı, ekleniyor...');
      userData.isAdmin = 1;
    } else if (typeof userData.isAdmin === 'string') {
      // isAdmin string ise sayıya çevir
      userData.isAdmin = parseInt(userData.isAdmin, 10);
      console.log('isAdmin string değerden sayıya çevrildi:', userData.isAdmin);
    } else {
      // isAdmin değerini 1 olarak ayarla
      userData.isAdmin = 1;
      console.log('isAdmin değeri 1 olarak güncellendi');
    }
    
    // Güncellenmiş veriyi localStorage'a kaydet
    localStorage.setItem('user', JSON.stringify(userData));
    
    console.log('Kullanıcı bilgileri güncellendi:', userData);
    alert('Admin yetkiniz güncellendi! Sayfayı yenilemek için tamam tuşuna basın.');
    
    // Sayfayı yenile
    window.location.reload();
    
  } catch (error) {
    console.error('Hata oluştu:', error);
    alert('Bir hata oluştu: ' + error.message);
  }
})(); 
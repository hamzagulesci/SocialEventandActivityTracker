/**
 * Ana Sayfa JavaScript Kodları
 * Bu dosya, ana sayfadaki etkinlik listesi ve arama işlevlerini yönetir.
 */

// Sayfa tamamen yüklendiğinde çalışacak kodlar
document.addEventListener('DOMContentLoaded', () => {
  // ===== DOM Elemanlarının Seçilmesi =====
  // Öne çıkan etkinliklerin gösterileceği konteyner
  const featuredEventsGrid = document.getElementById('featured-events-grid'); 
  // Etkinlik arama formu
  const searchForm = document.getElementById('search-form'); 
  // Şehir giriş alanı
  const locationInput = document.getElementById('location'); 
  // Şehir önerileri için açılır liste
  const locationSuggestions = document.getElementById('location-suggestions'); 
  // Etkinlik kategorisi seçim kutusu
  const categorySelect = document.getElementById('category'); 
  
  // ===== Veri Depolama Değişkenleri =====
  // Tüm etkinlikleri saklayacak dizi
  let allEvents = []; 
  // Benzersiz şehirleri saklayacak küme (her şehir sadece bir kez eklenir)
  let cities = new Set();
  
  /**
   * API'den etkinlikleri getiren fonksiyon
   * Sunucudan tüm etkinlikleri çeker, şehir listesini oluşturur ve öne çıkan etkinlikleri gösterir
   */
  async function fetchEvents() {
    try {
      // API'ye HTTP GET isteği gönder ve yanıtı bekle
      const response = await fetch(`${API_URL}/events`);
      // Yanıtı JSON formatında çözümle
      const events = await response.json();
      // Tüm etkinlikleri global değişkene kaydet
      allEvents = events;
      
      // Etkinliklerden şehir listesini oluştur
      events.forEach(event => {
        if (event.location) {
          // Konum bilgisinden şehir adını çıkar (virgül öncesi kısım)
          const city = event.location.split(',')[0].trim();
          // Benzersiz şehirler kümesine ekle
          cities.add(city);
        }
      });
      
      // Öne çıkan etkinlikleri göster (en yakın 6 etkinlik)
      displayFeaturedEvents(events);
      
      // Yükleniyor mesajını kaldır
      const loadingElement = featuredEventsGrid.querySelector('.loading');
      if (loadingElement) {
        loadingElement.remove();
      }
    } catch (err) {
      // Hata durumunda konsola hata mesajı yazdır
      console.error('Etkinlikler yüklenirken hata oluştu:', err);
      // Kullanıcıya hata mesajı göster
      featuredEventsGrid.innerHTML = '<p class="error">Etkinlikler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>';
    }
  }
  
  /**
   * Öne çıkan etkinlikleri gösteren fonksiyon
   * Bugünden sonraki en yakın 6 etkinliği seçer ve ana sayfada gösterir
   * @param {Array} events - Tüm etkinliklerin bulunduğu dizi
   */
  function displayFeaturedEvents(events) {
    // ===== Etkinlikleri Filtreleme ve Sıralama =====
    // Bugünün tarihini al
    const today = new Date();
    // Bugünden sonraki etkinlikleri filtrele
    const upcomingEvents = events
      .filter(event => new Date(event.date) >= today) // Sadece gelecekteki etkinlikler
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // Tarihe göre artan sıralama
    
    // En yakın 6 etkinliği seç
    const featuredEvents = upcomingEvents.slice(0, 6);
    
    // Eğer yaklaşan etkinlik yoksa bilgi mesajı göster
    if (featuredEvents.length === 0) {
      featuredEventsGrid.innerHTML = '<p>Yaklaşan etkinlik bulunamadı.</p>';
      return;
    }
    
    // Etkinlik gösterim alanını temizle
    featuredEventsGrid.innerHTML = '';
    
    // ===== Her bir etkinlik için kart oluşturma =====
    featuredEvents.forEach(event => {
      // Etkinlik tarihini JavaScript Date nesnesine çevir
      const eventDate = new Date(event.date);
      
      // Tarihi Türkçe formatında biçimlendir (1 Ocak 2025 gibi)
      const formattedDate = eventDate.toLocaleDateString('tr-TR', {
        day: 'numeric',    // Gün (1-31)
        month: 'long',     // Ay adı (Ocak, Şubat...)
        year: 'numeric'    // Yıl (2025)
      });
      
      // Saati Türkçe formatında biçimlendir (14:30 gibi)
      const formattedTime = eventDate.toLocaleTimeString('tr-TR', {
        hour: '2-digit',   // Saat (00-23)
        minute: '2-digit'  // Dakika (00-59)
      });
      
      // ===== Etkinlik Kartı Oluşturma =====
      // Ana kart konteynerı
      const eventCard = document.createElement('div');
      eventCard.className = 'event-card';
      
      // Etkinlik resmi konteynerı
      const eventImageDiv = document.createElement('div');
      eventImageDiv.className = 'event-image';
      
      // Etkinlik resmi elementi
      const eventImage = document.createElement('img');
      eventImage.src = event.image;  // Resim URL'si
      eventImage.alt = event.title;  // Erişilebilirlik için alternatif metin
      eventImageDiv.appendChild(eventImage);  // Resmi konteynerına ekle
      
      // Etkinlik bilgileri konteynerı
      const eventInfoDiv = document.createElement('div');
      eventInfoDiv.className = 'event-info';
      
      // Etkinlik başlığı elementi
      const eventTitle = document.createElement('h3');
      eventTitle.textContent = event.title;  // Başlık metni
      eventInfoDiv.appendChild(eventTitle);  // Başlığı bilgi konteynerına ekle
      
      // Etkinlik meta bilgileri konteynerı (tarih, konum, kategori)
      const eventMetaDiv = document.createElement('div');
      eventMetaDiv.className = 'event-meta';
      
      // Tarih bilgisi
      const dateP = document.createElement('p');
      const dateIcon = document.createElement('i');
      dateIcon.className = 'fas fa-calendar';
      dateP.appendChild(dateIcon);
      dateP.appendChild(document.createTextNode(' ' + formattedDate));
      eventMetaDiv.appendChild(dateP);
      
      // Saat bilgisi
      const timeP = document.createElement('p');
      const timeIcon = document.createElement('i');
      timeIcon.className = 'fas fa-clock';
      timeP.appendChild(timeIcon);
      timeP.appendChild(document.createTextNode(' ' + formattedTime));
      eventMetaDiv.appendChild(timeP);
      
      // Konum bilgisi
      const locationP = document.createElement('p');
      const locationIcon = document.createElement('i');
      locationIcon.className = 'fas fa-map-marker-alt';
      locationP.appendChild(locationIcon);
      locationP.appendChild(document.createTextNode(' ' + event.location));
      eventMetaDiv.appendChild(locationP);
      
      eventInfoDiv.appendChild(eventMetaDiv);
      
      // Etkinlik açıklaması
      const eventDesc = document.createElement('p');
      eventDesc.className = 'event-description';
      const shortDesc = event.description.length > 100 ? 
                        event.description.substring(0, 100) + '...' : 
                        event.description;
      eventDesc.textContent = shortDesc;
      eventInfoDiv.appendChild(eventDesc);
      
      // Detaylar butonu
      const detailsLink = document.createElement('a');
      detailsLink.href = 'event-detail.html?id=' + event._id;
      detailsLink.className = 'btn';
      detailsLink.textContent = 'Detaylar';
      eventInfoDiv.appendChild(detailsLink);
      
      // Oluşturduğumuz elemanları etkinlik kartına ekliyoruz
      eventCard.appendChild(eventImageDiv);
      eventCard.appendChild(eventInfoDiv);
      
      featuredEventsGrid.appendChild(eventCard);
    });
  }
  
  // Kategori veya konum değiştiğinde otomatik olarak etkinlikler sayfasına yönlendir
  if (categorySelect) {
    categorySelect.addEventListener('change', () => {
      const category = categorySelect.value;
      const location = locationInput.value;
      
      // Etkinlikler sayfasına yönlendir
      window.location.href = `events.html?category=${encodeURIComponent(category)}&location=${encodeURIComponent(location)}`;
    });
  }
  
  // Arama formunun gönderilmesini engelle
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
    });
  }
  
  // Konum alanına yazıldığında şehir önerileri gösteren fonksiyon
  // Anlık arama özelliklerini sağlar
  if (locationInput) {
    locationInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.trim().toLowerCase();
      
      if (searchTerm.length < 2) {
        locationSuggestions.innerHTML = '';
        locationSuggestions.classList.remove('active');
        return;
      }
      
      // Konum değiştiğinde ve 2 karakterden fazla olduğunda otomatik olarak arama yap
      clearTimeout(window.searchTimeout); // Önceki zamanlayıcıyı temizle
      
      window.searchTimeout = setTimeout(() => {
        if (searchTerm.length >= 2 || searchTerm.length === 0) {
          const category = categorySelect.value;
          // URL parametrelerini kullanmadan doğrudan events.html sayfasına yönlendir
          window.location.href = `events.html`;
          
          // Filtreleme bilgilerini localStorage'a kaydet
          localStorage.setItem('eventFilterCategory', category);
          localStorage.setItem('eventFilterLocation', searchTerm);
        }
      }, 500); // 500ms bekle
      
      /**
       * Türkçe karakterleri normalize eden yardımcı fonksiyon
       * Arama ve karşılaştırmalarda Türkçe karakterleri İngilizce eşdeğerlerine dönüştürür
       * Böylece 'İstanbul' ve 'istanbul' aynı sonuçları verir
       * @param {string} text - Normalize edilecek metin
       * @returns {string} - Normalize edilmiş metin
       */
      const normalizeText = (text) => {
        return text.toLowerCase()  // Önce tüm metni küçük harfe çevir
          // Aksan işaretlerini kaldır (NFD normalizasyonu ile)
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          // Türkçe karakterleri İngilizce eşdeğerlerine dönüştür
          .replace(/\u0130/g, 'i').replace(/\u0131/g, 'i')  // İ, ı -> i
          .replace(/\u00c7/g, 'c').replace(/\u00e7/g, 'c')  // Ç, ç -> c
          .replace(/\u011e/g, 'g').replace(/\u011f/g, 'g')  // Ğ, ğ -> g
          .replace(/\u00d6/g, 'o').replace(/\u00f6/g, 'o')  // Ö, ö -> o
          .replace(/\u015e/g, 's').replace(/\u015f/g, 's')  // Ş, ş -> s
          .replace(/\u00dc/g, 'u').replace(/\u00fc/g, 'u');  // Ü, ü -> u
      };
      
      // Arama terimini normalize et (Türkçe karakter duyarsız hale getir)
      const normalizedSearchTerm = normalizeText(searchTerm);
      
      // ===== Şehir Önerilerini Filtreleme =====
      // Şehir listesinden arama terimine uyan şehirleri filtrele
      const filteredCities = Array.from(cities).filter(city => {
        // Şehir adını normalize et (Türkçe karakter duyarsız hale getir)
        const normalizedCity = normalizeText(city);
        // Normalize edilmiş şehir adı normalize edilmiş arama terimini içeriyor mu kontrol et
        return normalizedCity.includes(normalizedSearchTerm);
      });
      
      // Tüm önerileri bir diziye topla
      const allSuggestions = [...filteredCities];
      
      // ===== Önerileri Gösterme =====
      if (allSuggestions.length > 0) {
        // Öneri konteynerını temizle
        locationSuggestions.innerHTML = '';
        
        // Her bir öneri için bir öğe oluştur
        allSuggestions.forEach(suggestion => {
          // Öneri öğesi oluştur
          const suggestionItem = document.createElement('div');
          suggestionItem.className = 'suggestion-item';
          suggestionItem.textContent = suggestion;
          
          // Öneriye tıklandığında giriş alanını doldur ve öneri listesini kapat
          suggestionItem.addEventListener('click', () => {
            locationInput.value = suggestion; // Seçilen öneriyi giriş alanına yaz
            locationSuggestions.innerHTML = ''; // Öneri listesini temizle
            locationSuggestions.classList.remove('active'); // Öneri listesini gizle
          });
          
          // Öneriyi listeye ekle
          locationSuggestions.appendChild(suggestionItem);
        });
        
        // Öneri listesini görünür yap
        locationSuggestions.classList.add('active');
      } else {
        // Eşleşen öneri yoksa listeyi temizle ve gizle
        locationSuggestions.innerHTML = '';
        locationSuggestions.classList.remove('active');
      }
    });
    
    // Sayfa tıklandığında öneri kutusunu kapat
    document.addEventListener('click', (e) => {
      if (e.target !== locationInput && e.target !== locationSuggestions) {
        locationSuggestions.classList.remove('active');
      }
    });
  }
  
  // Sayfa yüklenirken etkinlikleri otomatik olarak getir
  fetchEvents(); // Uygulama başladığında etkinlikleri yükle
});

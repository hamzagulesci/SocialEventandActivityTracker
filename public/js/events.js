/**
 * Etkinlikler Sayfası JavaScript Kodları
 * Bu dosya, etkinlikler sayfasındaki filtreleme ve listeleme işlevlerini yönetir.
 */

// Sayfa tamamen yüklendiğinde çalışacak kodlar
document.addEventListener('DOMContentLoaded', () => {
  // ===== DOM Elemanlarının Seçilmesi =====
  // Etkinliklerin gösterileceği ana konteyner
  const eventsGrid = document.getElementById('events-grid');
  // Filtreleme formu
  const filterForm = document.getElementById('filter-form');
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
  
  // ===== Sayfa Yüklenirken Filtreleme Bilgilerini Al =====
  // Ana sayfadan yönlendirilen filtreleme parametrelerini localStorage'dan al
  const categoryParam = localStorage.getItem('eventFilterCategory');
  const locationParam = localStorage.getItem('eventFilterLocation');
  
  // Form alanlarını localStorage'dan alınan bilgilerle doldur
  if (categoryParam) {
    categorySelect.value = categoryParam; // Kategori seçimini ayarla
  }
  
  if (locationParam) {
    locationInput.value = locationParam; // Şehir girişini ayarla
  }
  
  // Filtreleme bilgileri kullanıldıktan sonra localStorage'dan temizle
  // Böylece sayfayı yeniden yüklediğimizde aynı filtreler tekrar uygulanmaz
  localStorage.removeItem('eventFilterCategory');
  localStorage.removeItem('eventFilterLocation');
  
  // Etkinlikleri getir
  async function fetchEvents() {
    try {
      // Tüm etkinlikleri getir
      const response = await fetch(`${API_URL}/events`);
      const events = await response.json();
      allEvents = events;
      
      // Şehirleri topla
      events.forEach(event => {
        if (event.location) {
          const city = event.location.split(',')[0].trim();
          cities.add(city);
        }
      });
      
      // localStorage'dan filtreleme bilgileri varsa, onları kullan
      if (categoryParam || locationParam) {
        filterAndDisplayEvents(categoryParam, locationParam);
      } else {
        // Filtreleme bilgileri yoksa tüm etkinlikleri göster
        displayEvents(events);
      }
      
      // Yükleniyor mesajını kaldır
      const loadingElement = eventsGrid.querySelector('.loading');
      if (loadingElement) {
        loadingElement.remove();
      }
    } catch (err) {
      console.error('Etkinlikler yüklenirken hata oluştu:', err);
      eventsGrid.innerHTML = '<p class="error">Etkinlikler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>';
    }
  }
  
  // Etkinlikleri göster
  function displayEvents(events) {
    if (events.length === 0) {
      eventsGrid.innerHTML = '<p>Etkinlik bulunamadı.</p>';
      return;
    }
    
    eventsGrid.innerHTML = '';
    
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
      
      // HTML şablonu kullanarak etkinlik kartı oluşturuyoruz
      const eventCard = document.createElement('div');
      eventCard.className = 'event-card';
      
      // Etkinlik resmi için bir div oluşturuyoruz
      const eventImageDiv = document.createElement('div');
      eventImageDiv.className = 'event-image';
      
      // Etkinlik resmi
      const eventImage = document.createElement('img');
      eventImage.src = event.image;
      eventImage.alt = event.title;
      eventImageDiv.appendChild(eventImage);
      
      // Etkinlik bilgileri için bir div oluşturuyoruz
      const eventInfoDiv = document.createElement('div');
      eventInfoDiv.className = 'event-info';
      
      // Etkinlik başlığı
      const eventTitle = document.createElement('h3');
      eventTitle.textContent = event.title;
      eventInfoDiv.appendChild(eventTitle);
      
      // Etkinlik meta bilgileri
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
      
      eventsGrid.appendChild(eventCard);
    });
  }
  
  // Kategori veya konum değiştiğinde otomatik olarak filtreleme yap
  if (categorySelect) {
    // Kategori değiştiğinde
    categorySelect.addEventListener('change', () => {
      // Filtreleme işlemini başlat
      filterEvents();
    });
  }
  
  // Filtreleme işlemini yapan fonksiyon
  function filterEvents() {
    const category = categorySelect.value;
    const location = locationInput.value;
    
    // Etkinlikleri filtrele ve göster
    filterAndDisplayEvents(category, location);
    
    // URL'i güncelle ama sayfa yenilenince parametreleri kullanma
    const url = new URL(window.location.href);
    url.search = ''; // URL parametrelerini temizle
    window.history.pushState({}, '', url);
  }
  
  // Etkinlikleri filtrele ve göster
  function filterAndDisplayEvents(category, location) {
    // Tüm etkinlikler içinden filtreleme yap
    let filteredEvents = [...allEvents];
    
    // Kategori filtrelemesi
    if (category) {
      filteredEvents = filteredEvents.filter(event => event.category === category);
    }
    
    // Konum filtrelemesi (büyük/küçük harf ve Türkçe karakter duyarsız)
    if (location && location.trim() !== '') {
      const locationNormalized = location.trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Aksanları kaldır
        .replace(/\u0130/g, 'i') // İ (büyük I) -> i
        .replace(/\u0131/g, 'i') // ı (küçük ı) -> i
        .replace(/\u00c7/g, 'c') // Ç (büyük Ç) -> c
        .replace(/\u00e7/g, 'c') // ç (küçük ç) -> c
        .replace(/\u011e/g, 'g') // Ğ (büyük Ğ) -> g
        .replace(/\u011f/g, 'g') // ğ (küçük ğ) -> g
        .replace(/\u00d6/g, 'o') // Ö (büyük Ö) -> o
        .replace(/\u00f6/g, 'o') // ö (küçük ö) -> o
        .replace(/\u015e/g, 's') // Ş (büyük Ş) -> s
        .replace(/\u015f/g, 's') // ş (küçük ş) -> s
        .replace(/\u00dc/g, 'u') // Ü (büyük Ü) -> u
        .replace(/\u00fc/g, 'u'); // ü (küçük ü) -> u
      
      filteredEvents = filteredEvents.filter(event => {
        if (event.location) {
          const eventCityNormalized = event.location.split(',')[0].trim().toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\u0130/g, 'i').replace(/\u0131/g, 'i')
            .replace(/\u00c7/g, 'c').replace(/\u00e7/g, 'c')
            .replace(/\u011e/g, 'g').replace(/\u011f/g, 'g')
            .replace(/\u00d6/g, 'o').replace(/\u00f6/g, 'o')
            .replace(/\u015e/g, 's').replace(/\u015f/g, 's')
            .replace(/\u00dc/g, 'u').replace(/\u00fc/g, 'u');
          
          return eventCityNormalized.includes(locationNormalized);
        }
        return false;
      });
    }
    
    // Filtrelenmiş etkinlikleri göster
    displayEvents(filteredEvents);
  }
  
  // Konum alanına yazıldığında şehir önerileri göster ve anlık arama yap
  if (locationInput) {
    // Anlık arama için debounce fonksiyonu
    let searchTimeout;
    
    locationInput.addEventListener('input', (e) => {
      // Önceki zamanlayıcıyı temizle
      clearTimeout(searchTimeout);
      
      // Yeni zamanlayıcı başlat (300ms gecikme ile)
      searchTimeout = setTimeout(() => {
        // Kullanıcı yazmayı bitirdikten 300ms sonra filtreleme yap
        if (e.target.value.trim().length >= 2 || e.target.value.trim().length === 0) {
          // Filtreleme işlemini başlat
          filterEvents();
        }
      }, 300);
      
      // Öneri özelliği kaldırıldı - doğrudan arama yapılıyor
      locationSuggestions.innerHTML = '';
      locationSuggestions.classList.remove('active');
    });
  }
  
  // Sayfa yüklendiğinde etkinlikleri getir
  fetchEvents();
});

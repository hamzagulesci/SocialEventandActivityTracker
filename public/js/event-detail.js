// Etkinlik detay sayfası JavaScript kodları
document.addEventListener('DOMContentLoaded', () => {
  const eventContent = document.getElementById('event-content');
  const participantCount = document.getElementById('participant-count');
  const participantLimit = document.getElementById('participant-limit');
  const joinBtn = document.getElementById('join-btn');
  const joinMessage = document.getElementById('join-message');
  const avgRating = document.getElementById('avg-rating');
  const ratingStars = document.getElementById('rating-stars');
  const reviewsList = document.getElementById('reviews-list');
  const noReviews = document.getElementById('no-reviews');
  const addReview = document.getElementById('add-review');
  const reviewForm = document.getElementById('review-form');
  const reviewWarning = document.getElementById('review-warning');
  
  // URL'den etkinlik ID'sini al
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');
  
  if (!eventId) {
    window.location.href = 'events.html';
    return;
  }
  
  // Etkinlik detaylarını getir
  async function fetchEventDetails() {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}`);
      const data = await response.json();
      
      if (data.event) {
        displayEventDetails(data.event, data.participationCount, data.reviews, data.averageRating);
      } else {
        eventContent.innerHTML = '<p class="error">Etkinlik bulunamadı.</p>';
      }
    } catch (err) {
      console.error('Etkinlik detayları yüklenirken hata oluştu:', err);
      eventContent.innerHTML = '<p class="error">Etkinlik detayları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>';
    }
  }
  
  // Etkinlik detaylarını göster
  function displayEventDetails(event, participationCount, reviews, averageRating) {
    // Etkinlik başlığını sayfa başlığına ekle
    document.title = `${event.title} | Sosyal Etkinlik ve Aktivite Takipçisi`;
    
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
    
    // Etkinlik içeriğini oluştur
    eventContent.innerHTML = `
      <img src="${event.image}" alt="${event.title}" class="event-detail-image">
      <div class="event-detail-info">
        <h1>${event.title}</h1>
        <div class="event-detail-meta">
          <p><i class="fas fa-calendar"></i> ${formattedDate}</p>
          <p><i class="fas fa-clock"></i> ${formattedTime}</p>
          <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
          <p><i class="fas fa-tag"></i> ${event.category}</p>
        </div>
        <div class="event-detail-description">
          ${event.description}
        </div>
      </div>
    `;
    
    // Katılımcı bilgilerini güncelle
    participantCount.textContent = `Katılımcı: ${participationCount}`;
    participantLimit.textContent = `Limit: ${event.participantLimit}`;
    
    // Katıl butonunu güncelle
    updateJoinButton(participationCount, event.participantLimit);
    
    // Değerlendirmeleri göster
    displayReviews(reviews, averageRating);
    
    // Yükleniyor mesajını kaldır
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(el => el.remove());
  }
  
  // Katıl butonunu güncelle
  function updateJoinButton(participationCount, participantLimit) {
    if (!isLoggedIn()) {
      joinBtn.textContent = 'Katılmak için giriş yapın';
      joinBtn.addEventListener('click', () => {
        window.location.href = `login.html?redirect=event-detail.html?id=${eventId}`;
      });
      return;
    }
    
    // Etkinliğe katılım durumunu kontrol et
    checkParticipationStatus();
    
    // Etkinlik dolu mu kontrol et
    if (participationCount >= participantLimit) {
      joinBtn.textContent = 'Etkinlik dolu';
      joinBtn.disabled = true;
      joinBtn.classList.remove('btn-success');
      joinBtn.classList.add('btn-outline');
    }
  }
  
  // Kullanıcının etkinliğe katılım durumunu kontrol et
  async function checkParticipationStatus() {
    if (!isLoggedIn()) return;
    
    try {
      const response = await fetch(`${API_URL}/events/${eventId}/join`, {
        method: 'GET',
        headers: setAuthHeader()
      });
      
      const data = await response.json();
      
      if (data.isParticipant) {
        joinBtn.textContent = 'Etkinliğe katıldınız';
        joinBtn.disabled = true;
        joinBtn.classList.remove('btn-success');
        joinBtn.classList.add('btn-outline');
      } else {
        joinBtn.addEventListener('click', joinEvent);
      }
    } catch (err) {
      console.error('Katılım durumu kontrol edilirken hata oluştu:', err);
    }
  }
  
  // Etkinliğe katıl
  async function joinEvent() {
    if (!isLoggedIn()) {
      window.location.href = `login.html?redirect=event-detail.html?id=${eventId}`;
      return;
    }
    
    try {
      joinBtn.disabled = true;
      joinBtn.textContent = 'İşleniyor...';
      
      const response = await fetch(`${API_URL}/events/${eventId}/join`, {
        method: 'POST',
        headers: setAuthHeader()
      });
      
      const data = await response.json();
      
      if (response.ok) {
        joinBtn.textContent = 'Etkinliğe katıldınız';
        joinBtn.classList.remove('btn-success');
        joinBtn.classList.add('btn-outline');
        joinMessage.textContent = data.message;
        joinMessage.classList.remove('error');
        joinMessage.classList.add('success');
        joinMessage.classList.remove('hidden');
        
        // Katılımcı sayısını güncelle
        const currentCount = parseInt(participantCount.textContent.split(':')[1].trim());
        participantCount.textContent = `Katılımcı: ${currentCount + 1}`;
        
        // Değerlendirme uyarısını gizle ve değerlendirme formunu göster
        reviewWarning.style.display = 'none';
        
        // Değerlendirme durumunu kontrol et
        checkReviewStatus();
      } else {
        joinBtn.disabled = false;
        joinBtn.textContent = 'Etkinliğe Katıl';
        joinMessage.textContent = data.message;
        joinMessage.classList.add('error');
        joinMessage.classList.remove('success');
        joinMessage.classList.remove('hidden');
      }
    } catch (err) {
      console.error('Etkinliğe katılırken hata oluştu:', err);
      joinBtn.disabled = false;
      joinBtn.textContent = 'Etkinliğe Katıl';
      joinMessage.textContent = 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
      joinMessage.classList.add('error');
      joinMessage.classList.remove('success');
      joinMessage.classList.remove('hidden');
    }
  }
  
  // Değerlendirmeleri göster
  function displayReviews(reviews, averageRating) {
    // Ortalama puanı göster
    avgRating.textContent = averageRating.toFixed(1);
    
    // Yıldızları göster
    ratingStars.innerHTML = generateStars(averageRating);
    
    // Değerlendirmeleri göster
    if (reviews && reviews.length > 0) {
      reviewsList.innerHTML = '';
      
      reviews.forEach(review => {
        const reviewDate = new Date(review.createdAt);
        const formattedDate = reviewDate.toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        reviewItem.innerHTML = `
          <div class="review-header">
            <span class="review-user">${review.user?.name ?? 'Anonim'}</span>
            <span class="review-date">${formattedDate}</span>
          </div>
          <div class="review-rating">
            ${generateStars(review.rating)}
          </div>
          <div class="review-comment">
            ${review.comment}
          </div>
        `;
        
        reviewsList.appendChild(reviewItem);
      });
      
      noReviews.classList.add('hidden');
    } else {
      reviewsList.innerHTML = '';
      noReviews.classList.remove('hidden');
    }
    
    // Kullanıcı giriş yapmışsa değerlendirme durumunu kontrol et
    if (isLoggedIn()) {
      checkReviewStatus();
      // Değerlendirme uyarısını başlangıçta göster, checkReviewStatus fonksiyonu içinde gerekirse gizlenecek
      reviewWarning.style.display = 'block';
    } else {
      // Giriş yapmayan kullanıcılara uyarı mesajı
      reviewWarning.innerHTML = '<i class="fas fa-info-circle"></i> Değerlendirme yapabilmek için önce giriş yapmalı ve etkinliğe katılmalısınız.';
      reviewWarning.style.display = 'block';
      addReview.classList.add('hidden');
    }
  }
  
  // Yıldız simgeleri oluştur
  function generateStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="fas fa-star"></i>';
    }
    
    if (halfStar) {
      stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    for (let i = 0; i < emptyStars; i++) {
      stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
  }
  
  // Kullanıcının değerlendirme durumunu kontrol et
  async function checkReviewStatus() {
    if (!isLoggedIn()) return;
    
    try {
      // Katılım durumunu kontrol et
      const participationResponse = await fetch(`${API_URL}/events/${eventId}/join`, {
        headers: setAuthHeader()
      });
      
      const participationData = await participationResponse.json();
      
      // Etkinliğe katılmamışsa, uyarı mesajını göster ve değerlendirme formunu gizle
      if (!participationData.isParticipant) {
        reviewWarning.style.display = 'block';
        addReview.classList.add('hidden');
        return;
      } else {
        reviewWarning.style.display = 'none';
      }
      
      // Değerlendirme yapmış mı kontrol et
      const reviewResponse = await fetch(`${API_URL}/events/${eventId}/reviews/check`, {
        headers: setAuthHeader()
      });
      
      const reviewData = await reviewResponse.json();
      
      if (!reviewData.hasReviewed) {
        addReview.classList.remove('hidden');
        reviewWarning.style.display = 'none';
        
        // Değerlendirme formu gönderildiğinde
        reviewForm.addEventListener('submit', submitReview);
      } else {
        // Zaten değerlendirme yapmışsa uyarı ve form gösterilmez
        reviewWarning.style.display = 'none';
        addReview.classList.add('hidden');
      }
    } catch (err) {
      console.error('Değerlendirme durumu kontrol edilirken hata oluştu:', err);
    }
  }
  
  // Değerlendirme gönder
  async function submitReview(e) {
    e.preventDefault();
    
    const rating = document.getElementById('rating').value;
    const comment = document.getElementById('comment').value;
    
    if (!rating || !comment) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/events/${eventId}/reviews`, {
        method: 'POST',
        headers: setAuthHeader(),
        body: JSON.stringify({ rating, comment })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Değerlendirme formunu gizle
        addReview.classList.add('hidden');
        
        // Değerlendirmeyi listeye ekle
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        
        const user = getCurrentUser();
        const reviewDate = new Date();
        const formattedDate = reviewDate.toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        
        reviewItem.innerHTML = `
          <div class="review-header">
            <span class="review-user">${user.name}</span>
            <span class="review-date">${formattedDate}</span>
          </div>
          <div class="review-rating">
            ${generateStars(parseInt(rating))}
          </div>
          <div class="review-comment">
            ${comment}
          </div>
        `;
        
        reviewsList.prepend(reviewItem);
        noReviews.classList.add('hidden');
        
        // Ortalama puanı güncelle
        fetchEventDetails();
      } else {
        alert(data.message || 'Değerlendirme gönderilirken bir hata oluştu.');
      }
    } catch (err) {
      console.error('Değerlendirme gönderilirken hata oluştu:', err);
      alert('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  }
  
  // Sayfa yüklendiğinde etkinlik detaylarını getir
  fetchEventDetails();
});

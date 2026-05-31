# Sosyal Etkinlik ve Aktivite Takipçisi

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.18-black?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?logo=mongodb&logoColor=white)
![Lisans](https://img.shields.io/badge/Lisans-MIT-blue)

Kullanıcıların çevrelerinde gerçekleşen sosyal etkinlikleri keşfetmelerine, bu etkinliklere katılmalarına ve deneyimlerini değerlendirmelerine olanak sağlayan tam yığın (full-stack) bir web uygulaması. Node.js, Express, MongoDB ve saf JavaScript ile inşa edilmiştir — herhangi bir frontend framework'ü kullanılmamıştır.

> İngilizce sürüm: [README.md](README.md)

---

## İçindekiler

- [Özellikler](#özellikler)
- [Teknoloji Yığını](#teknoloji-yığını)
- [Proje Yapısı](#proje-yapısı)
- [Veritabanı Modelleri](#veritabanı-modelleri)
- [API Uç Noktaları](#api-uç-noktaları)
- [Başlarken](#başlarken)
- [Örnek Veriler](#örnek-veriler)
- [Ekran Görüntüleri](#ekran-görüntüleri)
- [Katkıda Bulunma](#katkıda-bulunma)
- [Lisans](#lisans)

---

## Özellikler

### Kullanıcı Yönetimi
- 70'den fazla avatar seçeneği ile kayıt olma
- 1 günlük token süresiyle JWT tabanlı giriş / çıkış
- Profil düzenleme: ad, e-posta ve avatar
- Rol tabanlı erişim kontrolü:
  - **Kullanıcı** (`isAdmin: 0`) — etkinliklere göz at, katıl ve değerlendir
  - **Admin** (`isAdmin: 1`) — etkinlik oluştur, düzenle ve sil; kullanıcıları yönet
  - **Sahip** (`isAdmin: 2`) — kullanıcı silme ve admin yönetimi dahil tam erişim

### Etkinlik Keşfi
- Tüm etkinlikleri duyarlı (responsive) kart düzeninde görüntüle
- Kategoriye göre filtrele: Konser, Festival, Spor, Sanat, Eğitim, Diğer
- Şehir veya konuma göre filtrele
- Ana sayfada öne çıkan yaklaşan etkinlikler
- Ayrıntılı etkinlik sayfaları: başlık, açıklama, tarih, konum, kapasite, görseller ve ortalama puan

### Etkinlik Katılımı
- Gerçek zamanlı kapasite kontrolü ile etkinliklere katılım (fazla kayıt önlenir)
- Veritabanı düzeyinde benzersiz bileşik indeks ile mükerrer katılım engeli
- Katıldığınız etkinlikleri profil sayfanızdan takip etme

### Değerlendirme ve Puanlama Sistemi
- Etkinlikleri 1–5 yıldız ile değerlendirme (yalnızca katılımcılara açık)
- Ayrıntılı metin yorumu yazma
- Veritabanı düzeyinde kullanıcı başına bir değerlendirme zorunluluğu
- Kendi değerlendirmelerinizi düzenleme veya silme
- Her etkinlik için otomatik ortalama puan hesaplama ve gösterme

### Admin Paneli
- Tam form doğrulaması ile yeni etkinlik oluşturma
- Mevcut etkinlik bilgilerini düzenleme
- Etkinlik silme
- Tüm kayıtlı kullanıcıları listeleme, arama ve sayfalama
- Herhangi bir kullanıcıya admin yetkisi verme veya geri alma

### Yasal Sayfalar
- Gizlilik Politikası
- Kullanım Koşulları
- Çerez Politikası

---

## Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Çalışma Ortamı | Node.js |
| Web Framework | Express.js 4.18 |
| Veritabanı | MongoDB |
| ODM | Mongoose 7 |
| Kimlik Doğrulama | JSON Web Token (jsonwebtoken 9) |
| Şifre Hashleme | bcryptjs 2.4 |
| CORS | cors 2.8 |
| Ortam Değişkenleri | dotenv 16 |
| Geliştirme Sunucusu | nodemon 2 |
| Frontend | HTML5, CSS3, Saf JavaScript |
| İkonlar | Font Awesome 6 |
| İstemci Oturumu | localStorage (JWT depolama) |

---

## Proje Yapısı

```
sosyal-etkinlik-takipcisi/
├── public/                        # Statik frontend dosyaları
│   ├── css/
│   │   └── style.css              # Ana stil dosyası (duyarlı, mobil öncelikli)
│   ├── js/
│   │   ├── auth.js                # İstemci tarafı kimlik doğrulama yardımcıları ve JWT yönetimi
│   │   ├── main.js                # Ana sayfa — öne çıkan etkinlikler yükleyici
│   │   ├── events.js              # Etkinlikler sayfası — filtreleme ve gösterim
│   │   ├── event-detail.js        # Etkinlik detayları, katılım ve yorum gönderimi
│   │   ├── admin.js               # Admin paneli — etkinlik ve kullanıcı CRUD işlemleri
│   │   ├── profile.js             # Kullanıcı profili — bilgi düzenleme ve katıldığı etkinlikler
│   │   ├── login.js               # Giriş formu işleme
│   │   ├── register.js            # Kayıt formu işleme
│   │   ├── components.js          # Yeniden kullanılabilir HTML bileşen yükleyici (header/footer)
│   │   └── password-toggle.js     # Şifre görünürlük geçişi
│   ├── avatar/                    # 70'den fazla kullanıcı avatarı görseli
│   ├── components/
│   │   ├── header.html            # Paylaşılan navigasyon çubuğu bileşeni
│   │   └── footer.html            # Paylaşılan alt bilgi bileşeni
│   ├── index.html                 # Ana sayfa
│   ├── events.html                # Etkinlikler listeleme sayfası
│   ├── event-detail.html          # Etkinlik detay sayfası
│   ├── profile.html               # Kullanıcı profil sayfası
│   ├── admin.html                 # Admin paneli
│   ├── admin-fix.html             # Admin yetki düzeltme yardımcı sayfası
│   ├── login.html                 # Giriş sayfası
│   ├── register.html              # Kayıt sayfası
│   ├── gizlilik-politikasi.html   # Gizlilik politikası
│   ├── kullanim-kosullari.html    # Kullanım koşulları
│   └── cerez-politikasi.html      # Çerez politikası
├── models/
│   ├── User.js                    # Kaydetme öncesi şifre hashleme kancası olan kullanıcı şeması
│   ├── Event.js                   # Etkinlik şeması
│   ├── Participation.js           # Kullanıcı–Etkinlik katılım ilişkisi şeması
│   └── Review.js                  # Puan ve yorum şeması
├── routes/
│   ├── users.js                   # Kimlik doğrulama ve kullanıcı yönetimi API uç noktaları
│   ├── events.js                  # Etkinlik CRUD ve katılım API uç noktaları
│   └── reviews.js                 # Değerlendirme CRUD API uç noktaları
├── middleware/
│   ├── auth.js                    # JWT doğrulama ara yazılımı
│   └── adminAuth.js               # Admin rol yetkilendirme ara yazılımı
├── server.js                      # Express uygulama giriş noktası ve MongoDB bağlantısı
├── seed.js                        # Veritabanı doldurma betiği (örnek veriler)
├── package.json                   # Proje bağımlılıkları ve betikler
└── .env                           # Ortam değişkenleri (git'e eklenmez)
```

---

## Veritabanı Modelleri

### Kullanıcı (User)

| Alan | Tür | Notlar |
|------|-----|--------|
| `name` | String | Zorunlu |
| `email` | String | Zorunlu, benzersiz |
| `password` | String | Kaydetme öncesi bcryptjs kancası ile hashlenir |
| `avatar` | String | Varsayılan: `avatar/avatar_01.png` |
| `isAdmin` | Number | `0` = Kullanıcı, `1` = Admin, `2` = Sahip |
| `createdAt` | Date | Oluşturulduğunda otomatik ayarlanır |

### Etkinlik (Event)

| Alan | Tür | Notlar |
|------|-----|--------|
| `title` | String | Zorunlu |
| `description` | String | Zorunlu |
| `date` | Date | Zorunlu |
| `location` | String | Örn: `"İstanbul, Kadıköy"` |
| `category` | String | Konser / Festival / Spor / Sanat / Eğitim / Diğer |
| `image` | String | Görsel URL'si |
| `participantLimit` | Number | Maksimum kapasite |
| `createdBy` | ObjectId | Etkinliği oluşturan admin Kullanıcı referansı |
| `createdAt` | Date | Oluşturulduğunda otomatik ayarlanır |

### Katılım (Participation)

| Alan | Tür | Notlar |
|------|-----|--------|
| `user` | ObjectId | Kullanıcı referansı |
| `event` | ObjectId | Etkinlik referansı |
| `joinedAt` | Date | Katılım anında otomatik ayarlanır |

> `(user, event)` üzerinde benzersiz bileşik indeks — mükerrer katılımı önler.

### Değerlendirme (Review)

| Alan | Tür | Notlar |
|------|-----|--------|
| `user` | ObjectId | Kullanıcı referansı (yorum yazarı) |
| `event` | ObjectId | Etkinlik referansı |
| `rating` | Number | Tam sayı, 1–5 yıldız |
| `comment` | String | Zorunlu yorum metni |
| `createdAt` / `updatedAt` | Date | Otomatik yönetilir |

> `(user, event)` üzerinde benzersiz bileşik indeks — kullanıcı başına etkinlik başına bir değerlendirme.

---

## API Uç Noktaları

### Kullanıcılar — `/api/users`

| Yöntem | Uç Nokta | Gerekli Yetki | Açıklama |
|--------|----------|---------------|----------|
| `POST` | `/register` | Herkese Açık | Yeni kullanıcı kaydı |
| `POST` | `/login` | Herkese Açık | Giriş yapma ve JWT token alma |
| `GET` | `/me` | Kullanıcı | Mevcut kullanıcının profilini getir |
| `PUT` | `/me` | Kullanıcı | Mevcut kullanıcının profilini güncelle |
| `POST` | `/avatar` | Kullanıcı | Avatarı değiştir |
| `GET` | `/me/events` | Kullanıcı | Katıldığı tüm etkinlikleri listele |
| `GET` | `/` | Admin | Tüm kayıtlı kullanıcıları listele |
| `PUT` | `/:id/make-admin` | Admin | Kullanıcıya admin rolü ver |
| `PUT` | `/:id/revoke-admin` | Admin | Kullanıcıdan admin rolünü geri al |
| `DELETE` | `/:id` | Sahip | Kullanıcı hesabını sil |

### Etkinlikler — `/api/events`

| Yöntem | Uç Nokta | Gerekli Yetki | Açıklama |
|--------|----------|---------------|----------|
| `GET` | `/` | Herkese Açık | Tüm etkinlikleri listele (`?category=` ve `?location=` filtreleri desteklenir) |
| `GET` | `/:id` | Herkese Açık | Katılım sayısı ve ortalama puanla birlikte etkinlik detaylarını getir |
| `POST` | `/` | Admin | Yeni etkinlik oluştur |
| `PUT` | `/:id` | Admin | Mevcut etkinliği güncelle |
| `DELETE` | `/:id` | Admin | Etkinliği sil |
| `GET` | `/:id/join` | Kullanıcı | Mevcut kullanıcının bu etkinliğe katılıp katılmadığını kontrol et |
| `POST` | `/:id/join` | Kullanıcı | Etkinliğe katıl (kapasite sınırı uygulanır) |
| `GET` | `/:id/reviews/check` | Kullanıcı | Mevcut kullanıcının bu etkinliği değerlendirip değerlendirmediğini kontrol et |
| `POST` | `/:id/reviews` | Kullanıcı | Değerlendirme gönder (önceki katılım gerektirir) |

### Değerlendirmeler — `/api/reviews`

| Yöntem | Uç Nokta | Gerekli Yetki | Açıklama |
|--------|----------|---------------|----------|
| `GET` | `/` | Herkese Açık | Tüm değerlendirmeleri getir (sayfalı) |
| `GET` | `/:id` | Herkese Açık | ID'ye göre belirli bir değerlendirmeyi getir |
| `GET` | `/user/:userId` | Herkese Açık | Belirli bir kullanıcının tüm değerlendirmelerini getir |
| `GET` | `/event/:eventId` | Herkese Açık | Belirli bir etkinliğin tüm değerlendirmelerini getir |
| `PUT` | `/:id` | Yazar | Kendi değerlendirmeni güncelle |
| `DELETE` | `/:id` | Yazar | Kendi değerlendirmeni sil |

---

## Başlarken

### Gereksinimler

- [Node.js](https://nodejs.org/) v18 veya üzeri
- Yerel olarak `27017` portunda çalışan [MongoDB](https://www.mongodb.com/)
- npm (Node.js ile birlikte gelir)

### Kurulum

```bash
# Depoyu klonlayın
git clone https://github.com/your-username/social-event-tracker.git
cd social-event-tracker

# Bağımlılıkları yükleyin
npm install
```

### Ortam Değişkenleri

Proje kök dizininde aşağıdaki içeriğe sahip bir `.env` dosyası oluşturun:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/etkinlik-takipcisi?retryWrites=true&w=majority
JWT_SECRET=etkinlik_takipcisi_jwt_secret_key
```

### Uygulamayı Çalıştırma

```bash
# Geliştirme — nodemon ile otomatik yeniden yükleme
npm run dev

# Üretim
npm start
```

Çalıştıktan sonra tarayıcınızı açın ve şu adreslere gidin:

- **Yerel:** `http://localhost:5000`
- **Yerel Ağ (LAN):** `http://<yerel-ip-adresiniz>:5000`

Sunucu başladığında her iki URL de konsola yazdırılır.

---

## Örnek Veriler

Veritabanını örnek kullanıcılar, etkinlikler, katılımlar ve değerlendirmelerle doldurmak için:

```bash
node seed.js
```

| Kaynak | Adet |
|--------|------|
| Kullanıcılar | 8 (1 sahip, 1 admin, 6 normal kullanıcı) |
| Etkinlikler | 15 (çeşitli kategoriler) |
| Katılımlar | 32 |
| Değerlendirmeler | 32 |

**Önceden oluşturulmuş test hesapları:**

| E-Posta | Şifre | Rol |
|---------|-------|-----|
| hamza@gmail.com | Hamza12345. | Sahip |
| selin@gmail.com | Selin12345. | Admin |
| ayse@gmail.com | Ayse12345. | Kullanıcı |

**Dahil edilen örnek etkinlik kategorileri:** Rock Konseri, Caz Festivali, Yoga Atölyesi, Kitap Fuarı, Teknoloji Zirvesi, Doğa Yürüyüşü, Tiyatro Gösterisi, Stand-up Komedi, Fotoğrafçılık Atölyesi, Sokak Lezzetleri Festivali, Sanat Sergisi ve daha fazlası.

---

## Ekran Görüntüleri

> Uygulamayı çalıştırdıktan sonra ana sayfa, etkinlikler listeleme, etkinlik detayı ve admin paneli ekran görüntülerini buraya ekleyebilirsiniz.

---

## Katkıda Bulunma

Katkılarınızı bekliyoruz! Başlamak için:

1. Depoyu forklayın
2. Yeni bir dal oluşturun: `git checkout -b ozellik/ozellik-adiniz`
3. Değişikliklerinizi işleyin: `git commit -m "Ekle: özellik açıklamanız"`
4. Dalınıza itin: `git push origin ozellik/ozellik-adiniz`
5. Bir Pull Request açın

---

## Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

---

© 2026 Sosyal Etkinlik ve Aktivite Takipçisi. Tüm hakları saklıdır.

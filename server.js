// Gerekli modülleri içe aktarıyoruz
const express = require('express'); // Web sunucu çerçevesi
const mongoose = require('mongoose'); // MongoDB veritabanı bağlantısı için
const cors = require('cors'); // Cross-Origin Resource Sharing (Farklı kaynaklardan istek yapabilmek için)
const path = require('path'); // Dosya yolları işlemleri için
const os = require('os'); // Ağ arayüzlerini okumak için
require('dotenv').config(); // .env dosyasından ortam değişkenlerini yüklemek için

// Route (yönlendirme) dosyalarını içe aktarıyoruz
const eventRoutes = require('./routes/events'); // Etkinlik işlemleri için API rotaları
const userRoutes = require('./routes/users'); // Kullanıcı işlemleri için API rotaları

// Express uygulamasını oluşturuyoruz
const app = express();

// Middleware (Ara yazılım) ayarları
app.use(cors()); // CORS politikalarını etkinleştiriyoruz - frontend ve backend arasındaki iletişimi sağlar
app.use(express.json()); // JSON formatındaki istekleri işleyebilmek için
app.use(express.static(path.join(__dirname, 'public'))); // Statik dosyaları (HTML, CSS, JS) sunmak için

// API rotalarını tanımlıyoruz
app.use('/api/events', eventRoutes); // /api/events ile başlayan tüm istekleri eventRoutes'a yönlendiriyoruz
app.use('/api/users', userRoutes); // /api/users ile başlayan tüm istekleri userRoutes'a yönlendiriyoruz

// Single Page Application (SPA) için tüm bilinmeyen rotaları ana sayfaya yönlendiriyoruz
// Bu sayede client-side routing çalışabilir (React Router, Vue Router vb.)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// MongoDB veritabanı bağlantısı ve sunucu başlatma
const PORT = process.env.PORT || 5000; // Sunucu portu, .env dosyasından veya varsayılan olarak 5000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/etkinlik-takipcisi'; // MongoDB bağlantı adresi

// Yerel ağ IP adresini bul
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// MongoDB'ye bağlanıyoruz
mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      const localIP = getLocalIP();
      const line = '─'.repeat(46);
      console.log(`\n  ${line}`);
      console.log(`  ✅  MongoDB bağlantısı başarılı`);
      console.log(`  🚀  Sunucu çalışıyor`);
      console.log(`  ${line}`);
      console.log(`  ➜  Localhost  :  http://localhost:${PORT}`);
      console.log(`  ➜  Network    :  http://${localIP}:${PORT}`);
      console.log(`  ${line}\n`);
    });
  })
  .catch(err => {
    console.error('\n❌ MongoDB bağlantı hatası:', err.message, '\n');
  });

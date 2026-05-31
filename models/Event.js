const mongoose = require('mongoose'); // MongoDB için ODM (Object Document Mapper) kütüphanesini içe aktarıyoruz

// Etkinlik veri modeli şemasını tanımlıyoruz
// Bu şema, veritabanındaki etkinlik dokümanlarının yapısını belirler
const EventSchema = new mongoose.Schema({
  title: {
    type: String, // Veri tipi: Metin
    required: true // Zorunlu alan, boş bırakılamaz
  }, // Etkinlik başlığı
  description: {
    type: String, // Veri tipi: Metin
    required: true // Zorunlu alan, boş bırakılamaz
  }, // Etkinlik açıklaması
  date: {
    type: Date, // Veri tipi: Tarih
    required: true // Zorunlu alan, boş bırakılamaz
  }, // Etkinlik tarihi ve saati
  location: {
    type: String, // Veri tipi: Metin
    required: true // Zorunlu alan, boş bırakılamaz
  }, // Etkinlik konumu (şehir, ilçe)
  category: {
    type: String, // Veri tipi: Metin
    required: true // Zorunlu alan, boş bırakılamaz
  }, // Etkinlik kategorisi (Konser, Festival, Spor, Sanat, Eğitim vb.)
  image: {
    type: String, // Veri tipi: Metin (URL)
    default: 'default-event.jpg' // Varsayılan değer, eğer görsel belirtilmezse
  }, // Etkinlik görselinin URL'i
  participantLimit: {
    type: Number, // Veri tipi: Sayı
    required: true // Zorunlu alan, boş bırakılamaz
  }, // Etkinliğe katılabilecek maksimum kişi sayısı
  createdAt: {
    type: Date, // Veri tipi: Tarih
    default: Date.now // Varsayılan değer, doküman oluşturulduğu andaki zaman
  }, // Etkinliğin oluşturulma tarihi
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, // Veri tipi: MongoDB ObjectId (referans)
    ref: 'User' // Referans verilen model: User
  } // Etkinliği oluşturan kullanıcının ID'si
});

// Event modelini oluşturup dışa aktarıyoruz
// Bu model, veritabanındaki 'events' koleksiyonunu temsil eder
module.exports = mongoose.model('Event', EventSchema);

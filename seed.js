const mongoose = require('mongoose');
const Event = require('./models/Event');
const User = require('./models/User');
const Participation = require('./models/Participation');
const Review = require('./models/Review');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/etkinlik-takipcisi';

const users = [
  {
    name: 'Hamza Güleşci',
    email: 'hamza@gmail.com',
    password: 'Enzo12345.',
    avatar: 'avatar/avatar_01.png',
    isAdmin: 2
  },
  {
    name: 'Ayşe Kaya',
    email: 'ayse@gmail.com',
    password: 'Ayse12345.',
    avatar: 'avatar/avatar_02.png',
    isAdmin: 0
  },
  {
    name: 'Mehmet Demir',
    email: 'mehmet@gmail.com',
    password: 'Mehmet12345.',
    avatar: 'avatar/avatar_03.png',
    isAdmin: 0
  },
  {
    name: 'Zeynep Arslan',
    email: 'zeynep@gmail.com',
    password: 'Zeynep12345.',
    avatar: 'avatar/avatar_04.png',
    isAdmin: 0
  },
  {
    name: 'Ali Yılmaz',
    email: 'ali@gmail.com',
    password: 'Ali12345.',
    avatar: 'avatar/avatar_05.png',
    isAdmin: 0
  },
  {
    name: 'Fatma Çelik',
    email: 'fatma@gmail.com',
    password: 'Fatma12345.',
    avatar: 'avatar/avatar_06.png',
    isAdmin: 0
  },
  {
    name: 'Can Öztürk',
    email: 'can@gmail.com',
    password: 'Can12345.',
    avatar: 'avatar/avatar_07.png',
    isAdmin: 0
  },
  {
    name: 'Selin Şahin',
    email: 'selin@gmail.com',
    password: 'Selin12345.',
    avatar: 'avatar/avatar_08.png',
    isAdmin: 1
  }
];

const events = [
  {
    title: 'Rock Konseri',
    description: 'Şehrin en iyi rock gruplarının performansıyla unutulmaz bir gece.',
    date: new Date('2025-05-15T20:00:00'),
    location: 'İstanbul, Kadıköy',
    category: 'Konser',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    participantLimit: 200
  },
  {
    title: 'Yoga Atölyesi',
    description: 'Profesyonel eğitmenler eşliğinde yoga ve meditasyon deneyimi.',
    date: new Date('2025-04-20T09:00:00'),
    location: 'İstanbul, Beşiktaş',
    category: 'Spor',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    participantLimit: 30
  },
  {
    title: 'Kitap Fuarı',
    description: 'Yüzlerce yayınevi ve yazarın katılımıyla gerçekleşecek büyük kitap fuarı.',
    date: new Date('2025-06-10T10:00:00'),
    location: 'Ankara, Çankaya',
    category: 'Eğitim',
    image: 'https://images.unsplash.com/photo-1526243741027-444d633d7365?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    participantLimit: 1000
  },
  {
    title: 'Sinema Gecesi',
    description: 'Açık havada klasik filmlerin gösterimi ve kokteyl.',
    date: new Date('2025-07-05T21:00:00'),
    location: 'İzmir, Konak',
    category: 'Sanat',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    participantLimit: 150
  },
  {
    title: 'Teknoloji Zirvesi',
    description: 'Sektörün önde gelen isimlerinin konuşmacı olarak katılacağı teknoloji zirvesi.',
    date: new Date('2025-05-25T09:00:00'),
    location: 'İstanbul, Şişli',
    category: 'Eğitim',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    participantLimit: 500
  },
  {
    title: 'Doğa Yürüyüşü',
    description: 'Belgrad Ormanı\'nda rehber eşliğinde doğa yürüyüşü ve piknik.',
    date: new Date('2025-04-30T08:00:00'),
    location: 'İstanbul, Sarıyer',
    category: 'Spor',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    participantLimit: 50
  },
  {
    title: 'Caz Festivali',
    description: 'Üç gün sürecek uluslararası caz festivali.',
    date: new Date('2025-08-15T18:00:00'),
    location: 'Antalya, Muratpaşa',
    category: 'Festival',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    participantLimit: 300
  },
  {
    title: 'Tiyatro Gösterisi',
    description: 'Ödüllü oyuncuların sahne alacağı özel tiyatro gösterisi.',
    date: new Date('2025-06-20T19:30:00'),
    location: 'Bursa, Nilüfer',
    category: 'Sanat',
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    participantLimit: 120
  },
  {
    title: 'Gastronomi Festivali',
    description: 'Farklı mutfaklardan lezzetlerin sunulacağı gastronomi festivali.',
    date: new Date('2025-07-10T12:00:00'),
    location: 'Gaziantep, Şahinbey',
    category: 'Festival',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    participantLimit: 400
  },
  {
    title: 'Fotoğrafçılık Atölyesi',
    description: 'Profesyonel fotoğrafçılardan portre fotoğrafçılığı teknikleri.',
    date: new Date('2026-07-05T14:00:00'),
    location: 'İzmir, Bornova',
    category: 'Eğitim',
    image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    participantLimit: 25
  },
  {
    title: 'Stand-up Komedi Gecesi',
    description: 'Ülkenin en komik stand-up sanatçılarının sahne aldığı eğlence dolu bir gece.',
    date: new Date('2026-06-14T20:30:00'),
    location: 'İstanbul, Beyoğlu',
    category: 'Sanat',
    image: 'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    participantLimit: 180
  },
  {
    title: 'Bisiklet Şehir Turu',
    description: 'Şehrin tarihi ve kültürel mekanlarını bisikletle keşfedin, rehber eşliğinde 3 saatlik tur.',
    date: new Date('2026-06-21T09:00:00'),
    location: 'İzmir, Alsancak',
    category: 'Spor',
    image: 'https://images.unsplash.com/photo-1502744688674-c619d1586c9e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    participantLimit: 40
  },
  {
    title: 'Web Geliştirme Bootcamp',
    description: 'HTML, CSS ve JavaScript temellerini öğrenin; iki günlük yoğun atölye.',
    date: new Date('2026-07-12T10:00:00'),
    location: 'Ankara, Kızılay',
    category: 'Eğitim',
    image: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    participantLimit: 35
  },
  {
    title: 'Sokak Yemekleri Festivali',
    description: 'Türkiye\'nin dört bir yanından gelen sokak lezzetleri, müzik ve eğlence bir arada.',
    date: new Date('2026-08-02T11:00:00'),
    location: 'Bursa, Osmangazi',
    category: 'Festival',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    participantLimit: 600
  },
  {
    title: 'Resim ve Heykel Sergisi',
    description: 'Genç sanatçıların eserlerinin sergilendiği açılış gecesi; sanatçılarla tanışma fırsatı.',
    date: new Date('2026-06-28T18:00:00'),
    location: 'İstanbul, Karaköy',
    category: 'Sanat',
    image: 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    participantLimit: 100
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB bağlantısı başarılı');

    await Review.deleteMany({});
    await Participation.deleteMany({});
    await Event.deleteMany({});
    await User.deleteMany({});
    console.log('Tüm koleksiyonlar temizlendi');

    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
    }
    console.log(`${createdUsers.length} kullanıcı başarıyla eklendi`);

    const createdEvents = await Event.insertMany(events);
    console.log(`${createdEvents.length} etkinlik başarıyla eklendi`);

    // user ve event indeksleri için kısa isimler
    const [hamza, ayse, mehmet, zeynep, ali, fatma, can, selin] = createdUsers;
    const [rock, yoga, kitap, sinema, teknoloji, dogaYuruyu, caz, tiyatro, gastronomi,
      fotografcilik, standup, bisiklet, webBootcamp, sokakYemek, resimSergi] = createdEvents;

    const participationData = [
      // Hamza
      { user: hamza._id, event: rock._id },
      { user: hamza._id, event: teknoloji._id },
      { user: hamza._id, event: caz._id },
      { user: hamza._id, event: webBootcamp._id },
      // Ayşe
      { user: ayse._id, event: yoga._id },
      { user: ayse._id, event: kitap._id },
      { user: ayse._id, event: sinema._id },
      { user: ayse._id, event: resimSergi._id },
      // Mehmet
      { user: mehmet._id, event: rock._id },
      { user: mehmet._id, event: dogaYuruyu._id },
      { user: mehmet._id, event: bisiklet._id },
      { user: mehmet._id, event: standup._id },
      // Zeynep
      { user: zeynep._id, event: yoga._id },
      { user: zeynep._id, event: tiyatro._id },
      { user: zeynep._id, event: gastronomi._id },
      { user: zeynep._id, event: fotografcilik._id },
      // Ali
      { user: ali._id, event: teknoloji._id },
      { user: ali._id, event: webBootcamp._id },
      { user: ali._id, event: kitap._id },
      { user: ali._id, event: caz._id },
      // Fatma
      { user: fatma._id, event: gastronomi._id },
      { user: fatma._id, event: sokakYemek._id },
      { user: fatma._id, event: sinema._id },
      { user: fatma._id, event: resimSergi._id },
      // Can
      { user: can._id, event: rock._id },
      { user: can._id, event: standup._id },
      { user: can._id, event: bisiklet._id },
      { user: can._id, event: dogaYuruyu._id },
      // Selin
      { user: selin._id, event: fotografcilik._id },
      { user: selin._id, event: tiyatro._id },
      { user: selin._id, event: resimSergi._id },
      { user: selin._id, event: sokakYemek._id }
    ];

    await Participation.insertMany(participationData);
    console.log(`${participationData.length} katılım kaydı eklendi`);

    const reviewData = [
      // Rock Konseri yorumları
      {
        user: hamza._id, event: rock._id, rating: 5,
        comment: 'Muhteşem bir geceydi! Grupların enerjisi inanılmazdı, bir daha gelmek isterim.'
      },
      {
        user: mehmet._id, event: rock._id, rating: 4,
        comment: 'Çok güzel bir organizasyondu. Ses sistemi biraz sorunluydu ama genel olarak harikaydı.'
      },
      {
        user: can._id, event: rock._id, rating: 5,
        comment: 'Hayatımın en iyi konseriydi! Kesinlikle tavsiye ederim.'
      },
      // Yoga Atölyesi yorumları
      {
        user: ayse._id, event: yoga._id, rating: 5,
        comment: 'Harikaydı! Eğitmen çok ilgili ve yardımseverdi. Hem beden hem zihin için çok faydalı bir deneyimdi.'
      },
      {
        user: zeynep._id, event: yoga._id, rating: 4,
        comment: 'Güzel bir etkinlikti. Mekan biraz küçüktü ama eğitmen mükemmeldi.'
      },
      // Kitap Fuarı yorumları
      {
        user: ayse._id, event: kitap._id, rating: 4,
        comment: 'Çok sayıda yazar ve yayınevi vardı. Saatlerce gezebilirsiniz. Harika bir atmosfer!'
      },
      {
        user: ali._id, event: kitap._id, rating: 5,
        comment: 'Beklediğimden çok daha iyiydi. Favori yazarımla tanışma fırsatı buldum.'
      },
      // Sinema Gecesi yorumları
      {
        user: ayse._id, event: sinema._id, rating: 4,
        comment: 'Açık havada film izlemek başlı başına güzel bir deneyim. Film seçimi de çok iyiydi.'
      },
      {
        user: fatma._id, event: sinema._id, rating: 3,
        comment: 'Etkinlik güzeldi ama kokteyl servisi oldukça yavaştı. Film seçimi güzeldi.'
      },
      // Teknoloji Zirvesi yorumları
      {
        user: hamza._id, event: teknoloji._id, rating: 5,
        comment: 'Sektörün en önemli isimleri bir aradaydı. Çok faydalı bağlantılar kurdum.'
      },
      {
        user: ali._id, event: teknoloji._id, rating: 4,
        comment: 'Konuşmacılar çok bilgiliydi. Yapay zeka ve geleceğin teknolojileri hakkında çok şey öğrendim.'
      },
      // Doğa Yürüyüşü yorumları
      {
        user: mehmet._id, event: dogaYuruyu._id, rating: 5,
        comment: 'Rehber çok bilgiliydi, orman hakkında fark etmediğimiz pek çok detayı anlattı. Kesinlikle tekrar geleceğim!'
      },
      {
        user: can._id, event: dogaYuruyu._id, rating: 4,
        comment: 'Çok keyifli geçti. Yürüyüş rotası mükemmeldi, piknik alanı da çok temizdi.'
      },
      // Caz Festivali yorumları
      {
        user: hamza._id, event: caz._id, rating: 5,
        comment: 'Üç gün boyunca harika müzik! Uluslararası sanatçıların performansları nefes kesiciydi.'
      },
      {
        user: ali._id, event: caz._id, rating: 4,
        comment: 'Çok iyi bir festival. Organizasyon kusursuzdu, bir dahaki yılda da katılacağım.'
      },
      // Tiyatro Gösterisi yorumları
      {
        user: zeynep._id, event: tiyatro._id, rating: 5,
        comment: 'Oyuncular sahne performanslarıyla bizi büyüledi. Yıllar sonra bile hatırlayacağım bir deneyim.'
      },
      {
        user: selin._id, event: tiyatro._id, rating: 5,
        comment: 'Müthiş bir performanstı! Metin çok güçlüydü, oyunculuk ise mükemmeldi.'
      },
      // Gastronomi Festivali yorumları
      {
        user: zeynep._id, event: gastronomi._id, rating: 4,
        comment: 'Farklı mutfaklardan lezzetler denedim. Özellikle Güneydoğu mutfağı standları harikaydı.'
      },
      {
        user: fatma._id, event: gastronomi._id, rating: 5,
        comment: 'Gastronomi tutkunları için cennet gibiydi! Her standda farklı bir lezzet keşfettim.'
      },
      // Fotoğrafçılık Atölyesi yorumları
      {
        user: zeynep._id, event: fotografcilik._id, rating: 5,
        comment: 'Eğitmenin anlattığı teknikler gerçekten işe yarıyor. Fotoğraflarım çok daha profesyonel görünmeye başladı.'
      },
      {
        user: selin._id, event: fotografcilik._id, rating: 4,
        comment: 'Çok öğretici bir atölyeydi. Küçük grup olduğu için herkese yeterli ilgi gösterildi.'
      },
      // Stand-up Komedi yorumları
      {
        user: mehmet._id, event: standup._id, rating: 5,
        comment: 'Karnım ağrıyana kadar güldüm! Sanatçılar gerçekten çok yetenekliydi.'
      },
      {
        user: can._id, event: standup._id, rating: 4,
        comment: 'Eğlenceli bir geceydi. Bazı sanatçılar diğerlerinden daha iyiydi ama genel olarak çok güzeldi.'
      },
      // Bisiklet Şehir Turu yorumları
      {
        user: mehmet._id, event: bisiklet._id, rating: 4,
        comment: 'Şehri bisikletle keşfetmek bambaşka bir deneyim. Rehber çok bilgiliydi ve eğlenceliydi.'
      },
      {
        user: can._id, event: bisiklet._id, rating: 5,
        comment: 'Mükemmel bir tur! Normalde fark etmediğim pek çok tarihi mekanı gördüm.'
      },
      // Web Geliştirme Bootcamp yorumları
      {
        user: hamza._id, event: webBootcamp._id, rating: 5,
        comment: 'İki günde çok şey öğrendim. Eğitmenler sabırlı ve konuya hakimdi. Kesinlikle tavsiye ederim!'
      },
      {
        user: ali._id, event: webBootcamp._id, rating: 4,
        comment: 'Yoğun ama çok verimli bir bootcamptı. Projeyi tamamladığımda çok gurur duydum.'
      },
      // Resim ve Heykel Sergisi yorumları
      {
        user: ayse._id, event: resimSergi._id, rating: 5,
        comment: 'Genç sanatçıların eserleri gerçekten etkileyiciydi. Sanatçılarla doğrudan konuşma fırsatı buldum.'
      },
      {
        user: fatma._id, event: resimSergi._id, rating: 4,
        comment: 'Çok güzel bir sergi. Bazı eserler gerçekten nefes kesici. Kesinlikle ziyaret edin!'
      },
      {
        user: selin._id, event: resimSergi._id, rating: 5,
        comment: 'Türk sanatının geleceği bu gençlerde. Her eser ayrı bir hikaye anlatıyordu.'
      },
      // Sokak Yemekleri Festivali yorumları
      {
        user: fatma._id, event: sokakYemek._id, rating: 5,
        comment: 'Türkiye\'nin dört bir yanından lezzetler! Günlerce yesem doymam. Organizasyon mükemmeldi.'
      },
      {
        user: selin._id, event: sokakYemek._id, rating: 4,
        comment: 'Çok eğlenceli bir festivaldi. Müzik eşliğinde yemek yemek ayrı bir keyif.'
      }
    ];

    await Review.insertMany(reviewData);
    console.log(`${reviewData.length} yorum başarıyla eklendi`);

    mongoose.connection.close();
    console.log('MongoDB bağlantısı kapatıldı');
  } catch (err) {
    console.error('Veritabanı hatası:', err.message);
    process.exit(1);
  }
}

seedDatabase();

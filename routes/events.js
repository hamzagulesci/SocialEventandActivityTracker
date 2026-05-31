const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Participation = require('../models/Participation');
const Review = require('../models/Review');
const auth = require('../middleware/auth');

// @route   GET /api/events
// @desc    Tüm etkinlikleri getir
// @access  Herkese açık
router.get('/', async (req, res) => {
  try {
    const { category, location } = req.query;
    const filter = {};

    // Sağlanan filtreleri uygula
    if (category) filter.category = category;
    if (location && location.trim() !== '') {
      // Sadece şehir bazında arama, büyük/küçük harfe duyarsız
      filter.location = { $regex: `^${location}`, $options: 'i' };
    }

    const events = await Event.find(filter).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   GET /api/events/:id
// @desc    ID’ye göre etkinlik getir
// @access  Herkese açık
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Etkinlik bulunamadı' });
    }

    // Katılım sayısını getir
    const participationCount = await Participation.countDocuments({ event: req.params.id });

    // Yorumları getir
    const reviews = await Review.find({ event: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    // Ortalama puanı hesapla
    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = totalRating / reviews.length;
    }

    res.json({
      event,
      participationCount,
      reviews,
      averageRating
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   GET /api/events/:id/join
// @desc    Kullanıcı etkinliğe katılmış mı kontrol et
// @access  Giriş yapılmış kullanıcı
router.get('/:id/join', auth, async (req, res) => {
  try {
    const participation = await Participation.findOne({
      user: req.user.id,
      event: req.params.id
    });

    res.json({ isParticipant: !!participation });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   POST /api/events/:id/join
// @desc    Etkinliğe katıl
// @access  Giriş yapılmış kullanıcı
router.post('/:id/join', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Etkinlik bulunamadı' });
    }

    // Etkinlik dolu mu kontrol et
    const participationCount = await Participation.countDocuments({ event: req.params.id });
    if (participationCount >= event.participantLimit) {
      return res.status(400).json({ message: 'Etkinlik katılımcı limitine ulaştı' });
    }

    // Kullanıcı zaten katıldı mı kontrol et
    const existingParticipation = await Participation.findOne({
      user: req.user.id,
      event: req.params.id
    });

    if (existingParticipation) {
      return res.status(400).json({ message: 'Bu etkinliğe zaten katıldınız' });
    }

    // Yeni katılım oluştur
    const participation = new Participation({
      user: req.user.id,
      event: req.params.id
    });

    await participation.save();
    res.status(201).json({ message: 'Etkinliğe başarıyla katıldınız' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   GET /api/events/:id/reviews/check
// @desc    Kullanıcı bu etkinliği değerlendirmiş mi kontrol et
// @access  Giriş yapılmış kullanıcı
router.get('/:id/reviews/check', auth, async (req, res) => {
  try {
    const review = await Review.findOne({
      user: req.user.id,
      event: req.params.id
    });

    res.json({ hasReviewed: !!review });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   POST /api/events/:id/reviews
// @desc    Etkinliğe değerlendirme ekle
// @access  Giriş yapılmış kullanıcı
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Puan ve yorum gereklidir' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Etkinlik bulunamadı' });
    }

    // Kullanıcı bu etkinliği zaten değerlendirmiş mi kontrol et
    const existingReview = await Review.findOne({
      user: req.user.id,
      event: req.params.id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Bu etkinlik için zaten bir değerlendirme yaptınız' });
    }

    // Yeni değerlendirme oluştur
    const review = new Review({
      user: req.user.id,
      event: req.params.id,
      rating,
      comment
    });

    await review.save();

    // Kullanıcı bilgilerini ekle
    await review.populate('user', 'name');

    res.status(201).json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   PUT /api/events/:id
// @desc    Etkinliği güncelle
// @access  Giriş yapılmış kullanıcı (Admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, date, location, category, image, participantLimit } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Etkinlik bulunamadı' });
    }

    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.location = location || event.location;
    event.category = category || event.category;
    event.image = image || event.image;
    event.participantLimit = participantLimit || event.participantLimit;

    await event.save();
    res.json(event);
  } catch (err) {
    console.error('Etkinlik güncelleme hatası:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Geçersiz ID formatı' });
    }
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   POST /api/events
// @desc    Yeni etkinlik oluştur
// @access  Giriş yapılmış kullanıcı
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, date, location, category, image, participantLimit } = req.body;

    // Yeni etkinlik oluştur
    const event = new Event({
      title,
      description,
      date,
      location,
      category,
      image: image || 'default-event.jpg',
      participantLimit,
      createdBy: req.user.id
    });

    await event.save();
    res.status(201).json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   DELETE /api/events/:id
// @desc    Etkinliği sil
// @access  Giriş yapılmış kullanıcı (Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Etkinliği bul
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Etkinlik bulunamadı' });
    }

    // Etkinliği sil
    await event.deleteOne();

    res.json({ message: 'Etkinlik başarıyla silindi' });
  } catch (err) {
    console.error('Etkinlik silme hatası:', err.message);

    // MongoDB ID formatı hatası
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Geçersiz ID formatı, etkinlik bulunamadı' });
    }

    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
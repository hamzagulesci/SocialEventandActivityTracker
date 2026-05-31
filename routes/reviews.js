const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// @route   GET /api/reviews
// @desc    Tüm değerlendirmeleri getir
// @access  Public
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name')
      .populate('event', 'title')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   GET /api/reviews/:id
// @desc    ID'ye göre değerlendirme getir
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'name')
      .populate('event', 'title');
    
    if (!review) {
      return res.status(404).json({ message: 'Değerlendirme bulunamadı' });
    }
    
    res.json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Değerlendirmeyi güncelle
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || !comment) {
      return res.status(400).json({ message: 'Puan ve yorum gereklidir' });
    }
    
    // Değerlendirmeyi bul
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Değerlendirme bulunamadı' });
    }
    
    // Kullanıcı yetkisini kontrol et
    if (review.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Bu işlem için yetkiniz yok' });
    }
    
    // Değerlendirmeyi güncelle
    review.rating = rating;
    review.comment = comment;
    
    await review.save();
    
    // Kullanıcı ve etkinlik bilgilerini doldur
    await review.populate('user', 'name');
    await review.populate('event', 'title');
    
    res.json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Değerlendirmeyi sil
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Değerlendirme bulunamadı' });
    }
    
    // Kullanıcı yetkisini kontrol et
    if (review.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Bu işlem için yetkiniz yok' });
    }
    
    await review.deleteOne();
    
    res.json({ message: 'Değerlendirme silindi' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   GET /api/reviews/user/:userId
// @desc    Kullanıcıya göre değerlendirmeleri getir
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.params.userId })
      .populate('event', 'title image date')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   GET /api/reviews/event/:eventId
// @desc    Etkinliğe göre değerlendirmeleri getir
// @access  Public
router.get('/event/:eventId', async (req, res) => {
  try {
    const reviews = await Review.find({ event: req.params.eventId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router; 
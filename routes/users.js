const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Event = require('../models/Event');
const Participation = require('../models/Participation');

// Middleware to protect routes
const auth = require('../middleware/auth');

// Admin middleware ekle
const adminAuth = require('../middleware/adminAuth');

// @route   POST /api/users/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Bu email adresi zaten kullanılıyor' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      avatar: avatar || 'avatar/avatar_01.png' // Eğer avatar seçilmişse kullan, yoksa default değeri kullan
    });

    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   POST /api/users/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Geçersiz email veya şifre' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Geçersiz email veya şifre' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   GET /api/users/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   PUT /api/users/me
// @desc    Update user profile
// @access  Private
router.put('/me', auth, async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    
    // Güncelleme alanlarını oluştur
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (avatar) updateFields.avatar = avatar;
    
    // Email değişiyorsa, zaten kullanımda mı kontrol et
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Bu email adresi zaten kullanımda' });
      }
    }
    
    // Kullanıcıyı güncelle
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   POST /api/users/avatar
// @desc    Update user avatar
// @access  Private
router.post('/avatar', auth, async (req, res) => {
  try {
    const { avatar } = req.body;
    
    if (!avatar) {
      return res.status(400).json({ message: 'Avatar alanı gereklidir' });
    }
    
    // Kullanıcıyı güncelle
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { avatar } },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   GET /api/users/me/events
// @desc    Get events that the user has joined
// @access  Private
router.get('/me/events', auth, async (req, res) => {
  try {
    // Kullanıcının katıldığı etkinlikleri bul
    const participations = await Participation.find({ user: req.user.id });
    
    if (participations.length === 0) {
      return res.json([]);
    }
    
    // Etkinlik ID'lerini al
    const eventIds = participations.map(p => p.event);
    
    // Etkinlikleri getir
    const events = await Event.find({ _id: { $in: eventIds } }).sort({ date: 1 });
    
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   PUT /api/users/:id/make-admin
// @desc    Kullanıcıyı admin yapmak için
// @access  Private - Sadece Adminler
router.put('/:id/make-admin', adminAuth, async (req, res) => {
  try {
    // Admin yapılacak kullanıcıyı bul
    const userToUpdate = await User.findById(req.params.id);
    
    if (!userToUpdate) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Admin değerini ata
    userToUpdate.isAdmin = 1;
    await userToUpdate.save();
    
    res.json({ 
      message: 'Kullanıcı başarıyla admin yapıldı',
      user: {
        id: userToUpdate.id,
        name: userToUpdate.name,
        email: userToUpdate.email,
        isAdmin: userToUpdate.isAdmin
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   GET /api/users
// @desc    Get all users - only for admins
// @access  Private (Admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    // Kullanıcıları getir, parolalar hariç
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Kullanıcı listesi getirme hatası:', err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   PUT /api/users/:id/revoke-admin
// @desc    Kullanıcının admin yetkisini geri almak için
// @access  Private - Sadece Adminler
router.put('/:id/revoke-admin', adminAuth, async (req, res) => {
  try {
    // Kendisinin yetkisini kaldırmaya çalışıyorsa engelle
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Kendi admin yetkinizi kaldıramazsınız' });
    }
    
    // Yetkisi alınacak kullanıcıyı bul
    const userToUpdate = await User.findById(req.params.id);
    
    if (!userToUpdate) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Kullanıcı zaten admin değilse hata döndür
    if (userToUpdate.isAdmin !== 1) {
      return res.status(400).json({ message: 'Bu kullanıcı zaten admin değil' });
    }
    
    // Admin yetkisini kaldır
    userToUpdate.isAdmin = 0;
    await userToUpdate.save();
    
    res.json({ 
      message: 'Kullanıcının admin yetkisi başarıyla kaldırıldı',
      user: {
        id: userToUpdate.id,
        name: userToUpdate.name,
        email: userToUpdate.email,
        isAdmin: userToUpdate.isAdmin
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Kullanıcıyı sil (Sadece Owner yetkisindeki kullanıcı silebilir)
// @access  Private - Sadece Owner
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    // İstek yapan kullanıcının owner olup olmadığını kontrol et
    const requestUser = await User.findById(req.user.id);
    if (!requestUser || requestUser.isAdmin !== 2) {
      return res.status(403).json({ 
        message: 'Bu işlem için owner yetkisi gerekiyor'
      });
    }
    
    // Kendi hesabını silmeye çalışmasını engelle
    if (req.params.id === req.user.id) {
      return res.status(400).json({ 
        message: 'Kendi hesabınızı silemezsiniz' 
      });
    }
    
    // Silinecek kullanıcıyı bul
    const userToDelete = await User.findById(req.params.id);
    
    // Kullanıcı yoksa hata döndür
    if (!userToDelete) {
      return res.status(404).json({ 
        message: 'Kullanıcı bulunamadı' 
      });
    }
    
    // Silme işlemi öncesi kullanıcı detaylarını al (yanıtta kullanmak için)
    const deletedUserDetails = {
      id: userToDelete.id,
      name: userToDelete.name,
      email: userToDelete.email
    };
    
    // Kullanıcıyı sil
    await User.findByIdAndRemove(req.params.id);
    
    res.json({ 
      message: 'Kullanıcı başarıyla silindi',
      user: deletedUserDetails
    });
  } catch (err) {
    console.error('Kullanıcı silme hatası:', err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;

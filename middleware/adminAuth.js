const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Admin yetkisi kontrolü yapan middleware
module.exports = async function(req, res, next) {
  try {
    // Kimlik doğrulama token'ını al
    const token = req.header('x-auth-token');
    
    // Token yoksa hata döndür
    if (!token) {
      return res.status(401).json({ message: 'Yetkilendirme hatası, token bulunamadı' });
    }
    
    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Token içindeki kullanıcı ID'sini al
    req.user = decoded;
    
    // Kullanıcının admin olup olmadığını kontrol et
    const user = await User.findById(decoded.id);
    
    // Kullanıcı bulunamadıysa hata döndür
    if (!user) {
      return res.status(403).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Admin veya owner yetkisi kontrolü (isAdmin 1 veya 2 olmalı)
    if (user.isAdmin !== 1 && user.isAdmin !== 2) {
      return res.status(403).json({ message: 'Bu işlem için admin yetkisi gerekiyor' });
    }
    
    // Eğer buraya kadar geldiyse, kullanıcı admin veya owner demektir
    next();
  } catch (err) {
    console.error('Admin yetki hatası:', err.message);
    
    // Token geçersiz veya süresi dolmuş
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Geçersiz token veya oturum süresi dolmuş' });
    }
    
    res.status(401).json({ message: 'Geçersiz token' });
  }
}; 
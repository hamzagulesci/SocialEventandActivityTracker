const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Token'ı header'dan al
  const token = req.header('x-auth-token');

  // Token yoksa hata döndür
  if (!token) {
    return res.status(401).json({ message: 'Yetkilendirme hatası, token bulunamadı' });
  }

  // Token'ı doğrula
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Geçersiz token' });
  }
};

const mongoose = require('mongoose');

const ParticipationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

// Bir kullanıcının bir etkinliğe sadece bir kez katılmasını sağla
ParticipationSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Participation', ParticipationSchema);

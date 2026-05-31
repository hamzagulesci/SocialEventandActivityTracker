const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

// Bir kullanıcı bir etkinlik için sadece bir değerlendirme yapabilir
ReviewSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);

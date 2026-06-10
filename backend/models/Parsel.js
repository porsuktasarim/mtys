const mongoose = require('mongoose');

const ParselSchema = new mongoose.Schema({
  projeId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Proje', required: true },
  adaNo:        String,
  parselNo:     { type: String, required: true },
  yuzolcumu:    { type: Number, required: true },
  araziVasfi:   String,   // mera, çayır, yaylak, kışlak
  verimDurumu:  { type: String, enum: ['çok iyi', 'iyi', 'orta', 'zayıf', ''], default: '' },
  il:           String,
  ilce:         String,
  mahalle:      String,
  mevkii:       String,
  tapuSayfaNo:  String,
  paftaNo:      String,
  notlar:       String,
  kaynak:       { type: String, default: 'excel' }
}, { timestamps: true });

ParselSchema.index({ projeId: 1, mahalle: 1 });

module.exports = mongoose.model('Parsel', ParselSchema);

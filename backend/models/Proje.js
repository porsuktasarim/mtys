const mongoose = require('mongoose');

const ProjeSchema = new mongoose.Schema({
  ad:            { type: String, required: true },
  il:            { type: String, required: true },
  ilce:          { type: String, required: true },
  yil:           { type: Number, required: true, default: () => new Date().getFullYear() },
  // EK-2'den gelen yağış kuşağı (mm aralığı)
  yagisKusagi:   { type: String, default: '350-500' },
  // EK-1'den belirlenen mera vasfı
  meraVasfi:     { type: String, enum: ['çok iyi','iyi','orta','zayıf'], default: 'orta' },
  otlatmaSuresi: { type: Number, default: 180 },
  mahalleler:    [String],
  durum:         { type: String, enum: ['taslak','hesaplandi','tamamlandi'], default: 'taslak' },
  aciklama:      String,
}, { timestamps: true });

module.exports = mongoose.model('Proje', ProjeSchema);

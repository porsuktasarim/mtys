const mongoose = require('mongoose');

const GorevliSchema = new mongoose.Schema({
  projeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proje', required: true },
  ad: String,
  soyad: String,
  adSoyad: { type: String, required: true },
  unvan: { type: String, required: true },
  gorev: String, // Komisyon Başkanı, Üye, Teknik Personel
  kurum: String,
  imzaVar: { type: Boolean, default: false },
  sira: { type: Number, default: 0 },
  kaynak: { type: String, default: 'excel' }
}, { timestamps: true });

module.exports = mongoose.model('Gorevli', GorevliSchema);

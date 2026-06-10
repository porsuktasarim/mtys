const mongoose = require('mongoose');

const HayvanSchema = new mongoose.Schema({
  projeId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Proje', required: true },
  kupeNo:       { type: String, required: true },
  tur:          { type: String, required: true },
  irk:          String,
  cinsiyet:     String,
  dogumTarihi:  Date,
  isletmeSahibi: String,  // kişi veya firma adı
  isletme:      String,   // bulunduğu işletme
  mahalle:      String,
  bbhbKatsayi:  { type: Number, default: 1.0 },
  bbhbKategori: Number,   // 1-16 arası resmi kategori no
  firmaFlag:    { type: Boolean, default: false }, // true = şirket/firma
  kaynak:       { type: String, default: 'excel' }
}, { timestamps: true });

HayvanSchema.index({ projeId: 1, mahalle: 1 });
HayvanSchema.index({ projeId: 1, isletmeSahibi: 1 });

module.exports = mongoose.model('Hayvan', HayvanSchema);

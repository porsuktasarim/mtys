const mongoose = require('mongoose');

const HesaplamaSchema = new mongoose.Schema({
  projeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proje', required: true },
  mahalle: { type: String, required: true },
  hesaplamaTarihi: { type: Date, default: Date.now },

  // Ek 4/a - BBHB Hesabı
  ek4a: {
    ciftciler: [{
      tcKimlikNo: String,
      adSoyad: String,
      isletme: String,
      hayvanlar: [{
        tur: String,
        adet: Number,
        katsayi: Number,
        toplamBBHB: Number
      }],
      toplamBBHB: Number
    }],
    genelToplamBBHB: Number
  },

  // Ek 4/b - Mera Kapasitesi
  ek4b: {
    parseller: [{
      adaParsel: String,
      mahalle: String,
      vasfi: String,
      alan: Number,
      kapasite: Number
    }],
    toplamAlan: Number,
    toplamKapasite: Number,
    meraAlani: Number,
    cayirAlani: Number,
    yaylakAlani: Number,
    kislakAlani: Number
  },

  // Ek 4/c - Karşılaştırma
  ek4c: {
    mevcutBBHB: Number,
    kapasiteBBHB: Number,
    fark: Number,
    durum: String // 'fazla' | 'açık' | 'dengeli'
  },

  // Ek 7 - Çiftçi listesi
  ek7: {
    ciftciler: [{
      siraNo: Number,
      adSoyad: String,
      tcKimlikNo: String,
      bbhb: Number,
      hayvanSayisi: Number
    }]
  },

  // Ek 7/a - Genel Bilgiler
  ek7a: {
    il: String,
    ilce: String,
    mahalle: String,
    yuzolcumu: Number,
    kayitTarihi: Date
  },

  // Ek 7/b - Parsel listesi
  ek7b: {
    parseller: Array,
    ozet: Object
  },

  // Ek 7/c - Komisyon tutanağı
  ek7c: {
    gorevliler: Array,
    tutanakTarihi: Date
  },

  // Ek 7/f - Tahsis kararı
  ek7f: {
    tahsisler: Array,
    ozet: Object
  },

  // Ek 8 - Tahsis özet cetveli
  ek8: {
    cetvel: Array,
    toplam: Object
  },

  durum: { type: String, default: 'tamamlandi' }
}, { timestamps: true });

HesaplamaSchema.index({ projeId: 1, mahalle: 1 });

module.exports = mongoose.model('Hesaplama', HesaplamaSchema);

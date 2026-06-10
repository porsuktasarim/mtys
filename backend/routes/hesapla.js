const express = require('express');
const router = express.Router();
const Proje = require('../models/Proje');
const Hayvan = require('../models/Hayvan');
const Parsel = require('../models/Parsel');
const Gorevli = require('../models/Gorevli');
const Hesaplama = require('../models/Hesaplama');
const { meraKapasiteHesapla, otVerimiHesapla, normalizeTur } = require('../utils/bbhb');

// Hesaplama başlat
router.post('/:projeId', async (req, res) => {
  try {
    const { projeId } = req.params;
    const { mahalleler: mahallelerRaw, tumMahalleler, seciliSahipler } = req.body;

    const proje = await Proje.findById(projeId);
    if (!proje) return res.status(404).json({ error: 'Proje bulunamadı' });

    // Mahalle listesi belirle
    let seciliMahalleler;
    if (tumMahalleler === 'true' || tumMahalleler === true) {
      seciliMahalleler = proje.mahalleler || [];
    } else if (mahallelerRaw) {
      seciliMahalleler = Array.isArray(mahallelerRaw) ? mahallelerRaw : [mahallelerRaw];
    } else {
      // Mahalle seçilmemişse projedeki tüm mahalleleri kullan
      seciliMahalleler = proje.mahalleler || [];
    }

    seciliMahalleler = seciliMahalleler.filter(Boolean);

    if (seciliMahalleler.length === 0) {
      // Veri varsa mahallesiz de hesapla
      const hayvanVar = await Hayvan.countDocuments({ projeId });
      const parselVar = await Parsel.countDocuments({ projeId });
      if (hayvanVar === 0 && parselVar === 0) {
        return res.status(400).json({ error: 'Önce veri yükleyin.' });
      }
      seciliMahalleler = ['genel'];
    }

    const sonuclar = [];
    const hatalar = [];

    for (const mahalle of seciliMahalleler) {
      try {
        const hesaplama = await mahalle_hesapla(projeId, mahalle, proje, seciliSahipler);
        sonuclar.push({ mahalle, hesaplamaId: hesaplama._id });
      } catch (e) {
        console.error(`${mahalle} hesaplama hatası:`, e);
        hatalar.push({ mahalle, hata: e.message });
      }
    }

    await Proje.findByIdAndUpdate(projeId, { durum: 'hesaplandi' });

    res.json({
      success: true,
      mesaj: `${sonuclar.length} mahalle için hesaplama tamamlandı.`,
      sonuclar,
      hatalar: hatalar.length > 0 ? hatalar : undefined
    });
  } catch (err) {
    console.error('Hesaplama genel hatası:', err);
    res.status(500).json({ error: err.message });
  }
});

// Hesaplama detay görüntüle
router.get('/:projeId/:mahalle', async (req, res, next) => {
  try {
    const { projeId, mahalle } = req.params;
    const proje = await Proje.findById(projeId);
    const hesaplama = await Hesaplama.findOne({ projeId, mahalle }).sort({ createdAt: -1 });

    if (!hesaplama) {
      return res.status(404).render('error', { title: '404', message: 'Hesaplama bulunamadı.', code: 404 });
    }

    res.render('hesapla/detay', { title: `${mahalle} Hesaplama`, proje, hesaplama });
  } catch (err) { next(err); }
});

async function mahalle_hesapla(projeId, mahalle, proje, seciliSahipler) {
  // Hayvanları çek — mahalle = 'genel' ise tüm mahalleleri al
  const hayvanQuery = { projeId };
  if (mahalle !== 'genel') hayvanQuery.mahalle = mahalle;

  let hayvanlar = await Hayvan.find(hayvanQuery);

  // Seçili sahip filtresi uygula
  if (seciliSahipler && seciliSahipler.length > 0) {
    const seciliSet = new Set(Array.isArray(seciliSahipler) ? seciliSahipler : [seciliSahipler]);
    hayvanlar = hayvanlar.filter(h => seciliSet.has(h.isletmeSahibi));
  }

  // Parselleri çek
  const parselQuery = { projeId };
  if (mahalle !== 'genel') parselQuery.mahalle = mahalle;
  const parseller = await Parsel.find(parselQuery);

  const gorevliler = await Gorevli.find({ projeId }).sort({ sira: 1 });

  if (hayvanlar.length === 0 && parseller.length === 0) {
    throw new Error(`${mahalle} için kayıt bulunamadı.`);
  }

  // Ot verimi hesabı
  const otVerimi = otVerimiHesapla(proje.yagisKusagi, proje.meraVasfi);
  const otlatmaSuresi = proje.otlatmaSuresi || 180;

  // EK 4/A — BBHB
  const ek4a = hesaplaEk4a(hayvanlar);

  // EK 4/B — Mera Kapasitesi (parsel bazında verim durumu)
  const ek4b = hesaplaEk4b(parseller, otVerimi.yararlanilabilirKuruOt, otlatmaSuresi, proje.yagisKusagi, proje.meraVasfi);

  // EK 4/C — Karşılaştırma
  const ek4c = {
    mevcutBBHB:   ek4a.genelToplamBBHB,
    kapasiteBBHB: ek4b.toplamKapasite,
    fark:         ek4b.toplamKapasite - ek4a.genelToplamBBHB,
    durum:        ek4b.toplamKapasite >= ek4a.genelToplamBBHB ? 'fazla' : 'açık',
    otVerimi
  };

  // EK 7 — Çiftçi listesi
  const ek7 = hesaplaEk7(ek4a);

  const ek7a = { il: proje.il, ilce: proje.ilce, mahalle, yuzolcumu: ek4b.toplamAlan };
  const ek7b = { parseller: ek4b.parseller, ozet: { toplamAlan: ek4b.toplamAlan, toplamKapasite: ek4b.toplamKapasite } };
  // EK 7/C — Çiftçi Hayvan Varlığı Tablosu (resmi format)
  const ek7c = hesaplaEk7c(hayvanlar, gorevliler);
  const ek7f = { tahsisler: ek7.ciftciler, ozet: { toplamBBHB: ek4a.genelToplamBBHB, toplamAlan: ek4b.toplamAlan } };
  const ek8  = { cetvel: ek7.ciftciler, toplam: { bbhb: ek4a.genelToplamBBHB, alan: ek4b.toplamAlan } };

  const hesaplama = await Hesaplama.findOneAndUpdate(
    { projeId, mahalle },
    { projeId, mahalle, hesaplamaTarihi: new Date(), ek4a, ek4b, ek4c, ek7, ek7a, ek7b, ek7c, ek7f, ek8, durum: 'tamamlandi' },
    { upsert: true, new: true }
  );

  return hesaplama;
}

function hesaplaEk4a(hayvanlar) {
  const sahipMap = {};

  hayvanlar.forEach(h => {
    const sahip = h.isletmeSahibi || 'Bilinmiyor';
    if (!sahipMap[sahip]) {
      sahipMap[sahip] = {
        adSoyad: sahip,
        isletme: h.isletme || '',
        firmaFlag: h.firmaFlag || false,
        turMap: {}
      };
    }
    const turNorm = normalizeTur(h.tur);
    const katsayi = h.bbhbKatsayi || 1.0;
    if (!sahipMap[sahip].turMap[turNorm]) {
      sahipMap[sahip].turMap[turNorm] = { tur: turNorm, adet: 0, katsayi, toplamBBHB: 0 };
    }
    sahipMap[sahip].turMap[turNorm].adet += 1;
    sahipMap[sahip].turMap[turNorm].toplamBBHB = Math.round((sahipMap[sahip].turMap[turNorm].toplamBBHB + katsayi) * 1000) / 1000;
  });

  let genelToplamBBHB = 0;
  const ciftciler = Object.values(sahipMap).map((c, i) => {
    const hayvanGruplari = Object.values(c.turMap);
    const toplamBBHB = Math.round(hayvanGruplari.reduce((s, h) => s + h.toplamBBHB, 0) * 1000) / 1000;
    genelToplamBBHB += toplamBBHB;
    return {
      siraNo: i + 1,
      adSoyad: c.adSoyad,
      isletme: c.isletme,
      firmaFlag: c.firmaFlag,
      hayvanlar: hayvanGruplari,
      toplamBBHB
    };
  }).sort((a, b) => b.toplamBBHB - a.toplamBBHB);

  return { ciftciler, genelToplamBBHB: Math.round(genelToplamBBHB * 1000) / 1000 };
}

function hesaplaEk4b(parseller, varsayilanOtVerimi, otlatmaSuresi, yagisKusagi, meraVasfi) {
  const { otVerimiHesapla } = require('../utils/bbhb');
  let toplamAlan = 0;
  let toplamKapasite = 0;

  const parselVerileri = parseller.map(p => {
    const alan = parseFloat(p.yuzolcumu) || 0;

    // Parsel bazında verim durumu varsa onu kullan, yoksa projenin genel vasfını kullan
    const parselVasfi = p.verimDurumu || meraVasfi || 'orta';
    const otVerimi = otVerimiHesapla(yagisKusagi, parselVasfi);
    const verim = otVerimi.yararlanilabilirKuruOt;
    const kapasite = meraKapasiteHesapla(alan, verim, otlatmaSuresi);

    toplamAlan += alan;
    toplamKapasite += kapasite;

    return {
      adaNo:        p.adaNo || '-',
      parselNo:     p.parselNo,
      mevkii:       p.mevkii || '-',
      vasfi:        p.araziVasfi || '-',
      verimDurumu:  parselVasfi,
      yararlanilabilirKuruOt: verim,
      alan:         Math.round(alan * 100) / 100,
      kapasite:     Math.round(kapasite * 100) / 100,
    };
  });

  return {
    parseller:      parselVerileri,
    toplamAlan:     Math.round(toplamAlan * 100) / 100,
    toplamKapasite: Math.round(toplamKapasite * 100) / 100,
    otlatmaSuresi
  };
}

// Resmi Ek 7/C sütun tanımları — Yönetmelik Madde 6
const EK7C_SUTUNLAR = [
  { key: 'kulturInek',     label: 'Kültür İnek',        katsayi: 1.00, grup: 'Kültür' },
  { key: 'kulturDanaDuve', label: 'Kültür Dana-Düve',   katsayi: 0.60, grup: 'Kültür' },
  { key: 'melezInek',      label: 'K.Melezi İnek',      katsayi: 0.75, grup: 'Kültür Melezi' },
  { key: 'melezDanaDuve',  label: 'K.Melezi Dana-Düve', katsayi: 0.45, grup: 'Kültür Melezi' },
  { key: 'yerliInek',      label: 'Yerli İnek',         katsayi: 0.50, grup: 'Yerli' },
  { key: 'yerliDanaDuve',  label: 'Yerli Dana-Düve',    katsayi: 0.30, grup: 'Yerli' },
  { key: 'koyun',          label: 'Koyun',              katsayi: 0.10, grup: 'Küçükbaş' },
  { key: 'keci',           label: 'Keçi',               katsayi: 0.08, grup: 'Küçükbaş' },
  { key: 'kuzuOglak',      label: 'Kuzu-Oğlak',        katsayi: 0.04, grup: 'Küçükbaş' },
  { key: 'mandaErkek',     label: 'Manda Erkek',        katsayi: 0.90, grup: 'Manda' },
  { key: 'mandaDisi',      label: 'Manda Dişi',         katsayi: 0.75, grup: 'Manda' },
  { key: 'boga',           label: 'Boğa',               katsayi: 1.50, grup: 'Erkek Sığır' },
  { key: 'okuz',           label: 'Öküz',               katsayi: 0.60, grup: 'Erkek Sığır' },
  { key: 'at',             label: 'At',                 katsayi: 0.50, grup: 'Diğer' },
  { key: 'esek',           label: 'Eşek',               katsayi: 0.30, grup: 'Diğer' },
  { key: 'katir',          label: 'Katır',              katsayi: 0.40, grup: 'Diğer' },
];

function hayvanEk7cKategori(h) {
  const { hayvanKategoriTespit } = require('../utils/bbhb');
  return hayvanKategoriTespit(h.tur, h.cinsiyet, h.dogumTarihi, h.irk).kategori;
}

function hesaplaEk7c(hayvanlar, gorevliler) {
  const { hayvanKategoriTespit } = require('../utils/bbhb');

  // 1. Adım: Çiftçileri listele
  const sahipMap = {};
  hayvanlar.forEach(h => {
    const sahip = (h.isletmeSahibi || '').trim() || 'Bilinmiyor';
    if (!sahipMap[sahip]) {
      sahipMap[sahip] = {
        adSoyad:   sahip,
        firmaFlag: h.firmaFlag || false,
      };
      // Her kategori sütununu 0 ile başlat
      EK7C_SUTUNLAR.forEach(s => { sahipMap[sahip][s.key] = 0; });
    }
  });

  // 2. Adım: Her hayvanı tür → ırk → yaş kurallarına göre kategoriye ekle
  hayvanlar.forEach(h => {
    const sahip = (h.isletmeSahibi || '').trim() || 'Bilinmiyor';
    const { kategori } = hayvanKategoriTespit(h.tur, h.cinsiyet, h.dogumTarihi, h.irk);

    // Kategori sütunu listede var mı kontrol et
    const sutunVar = EK7C_SUTUNLAR.some(s => s.key === kategori);
    if (sutunVar) {
      sahipMap[sahip][kategori] = (sahipMap[sahip][kategori] || 0) + 1;
    } else {
      // Bilinmeyen kategori → yerliInek'e ekle
      sahipMap[sahip]['yerliInek'] = (sahipMap[sahip]['yerliInek'] || 0) + 1;
    }
  });

  // 3. Adım: BBHB hesapla ve sırala (ada göre alfabetik)
  const ciftciler = Object.values(sahipMap)
    .map((c, i) => {
      let bbhb = 0;
      EK7C_SUTUNLAR.forEach(s => {
        bbhb += (c[s.key] || 0) * s.katsayi;
      });
      return { ...c, siraNo: i + 1, bbhbToplam: Math.round(bbhb * 1000) / 1000 };
    })
    .sort((a, b) => a.adSoyad.localeCompare(b.adSoyad, 'tr'));

  ciftciler.forEach((c, i) => { c.siraNo = i + 1; });

  // 4. Adım: Toplam satırı
  const toplam = { adSoyad: 'TOPLAM', bbhbToplam: 0 };
  EK7C_SUTUNLAR.forEach(s => {
    toplam[s.key] = ciftciler.reduce((sum, c) => sum + (c[s.key] || 0), 0);
    toplam.bbhbToplam += toplam[s.key] * s.katsayi;
  });
  toplam.bbhbToplam = Math.round(toplam.bbhbToplam * 1000) / 1000;

  return {
    sutunlar:   EK7C_SUTUNLAR,
    ciftciler,
    toplam,
    gorevliler: gorevliler.map(g => ({
      adSoyad: g.adSoyad, unvan: g.unvan, gorev: g.gorev || '', kurum: g.kurum || ''
    }))
  };
}

function hesaplaEk7(ek4a) {
  const ciftciler = (ek4a.ciftciler || []).map((c, i) => ({
    siraNo: i + 1,
    adSoyad: c.adSoyad,
    isletme: c.isletme,
    bbhb: c.toplamBBHB,
    hayvanSayisi: (c.hayvanlar || []).reduce((s, h) => s + h.adet, 0)
  }));
  return { ciftciler };
}

module.exports = router;
module.exports.mahalle_hesapla = mahalle_hesapla;

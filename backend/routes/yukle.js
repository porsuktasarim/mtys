const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const upload = require('../middleware/upload');
const Proje = require('../models/Proje');
const Hayvan = require('../models/Hayvan');
const Parsel = require('../models/Parsel');
const Gorevli = require('../models/Gorevli');
const {
  parseExcel, getExcelHeaders,
  HAYVAN_KOLON_TAHMINI, PARSEL_KOLON_TAHMINI, GOREVLI_KOLON_TAHMINI,
  kolonEslestirmeTahmin, veriDonustur
} = require('../utils/excelParser');
const { bbhbKatsayiHesapla, normalizeIrk } = require('../utils/bbhb');

// Şirket/firma tespiti
function firmaDetect(isim) {
  if (!isim) return false;
  const s = isim.toUpperCase();
  return /A\.Ş\.|A\.S\.|LTD\.|LTD\.ŞTİ\.|KOOPERATİF\.|KOOP\.|TİC\.|TIC\.|SAN\.|A\.Ş|LTD|ŞİRKET|SIRKET|HOLDING|GROUP|GRUP/.test(s);
}

// Dosya yükleme sayfası
router.get('/:projeId', async (req, res, next) => {
  try {
    const proje = await Proje.findById(req.params.projeId);
    if (!proje) return res.status(404).render('error', { title: '404', message: 'Proje bulunamadı.', code: 404 });
    res.render('yukle/index', { title: 'Dosya Yükleme', proje });
  } catch (err) { next(err); }
});

// Her dosya türü için ayrı yükleme endpoint'leri
// Hayvan listesi yükle
router.post('/:projeId/excel', upload.fields([
  { name: 'hayvanListesi', maxCount: 5 },
  { name: 'parselListesi', maxCount: 5 },
  { name: 'gorevliListesi', maxCount: 3 }
]), async (req, res) => {
  try {
    const proje = await Proje.findById(req.params.projeId);
    if (!proje) return res.status(404).json({ error: 'Proje bulunamadı' });

    // En az bir dosya veya CSV metni zorunlu
    const herhangiDosya = req.files.hayvanListesi || req.files.parselListesi || req.files.gorevliListesi;
    const csvMetin = req.body.hayvanCsv || req.body.parselCsv || req.body.gorevliCsv;

    if (!herhangiDosya && !csvMetin) {
      return res.status(400).json({ error: 'En az bir dosya yükleyin veya CSV yapıştırın.' });
    }

    const sonuc = { hayvan: [], parsel: [], gorevli: [] };

    // Hayvan dosyaları
    for (const file of (req.files.hayvanListesi || [])) {
      try {
        const headers = getExcelHeaders(file.path);
        const ilkSheet = Object.keys(headers)[0];
        sonuc.hayvan.push({
          dosyaAdi: file.originalname,
          dosyaYolu: file.path,
          tur: 'hayvan',
          sheetler: Object.keys(headers).map(s => ({
            isim: s, headers: headers[s],
            tahmin: kolonEslestirmeTahmin(headers[s] || [], HAYVAN_KOLON_TAHMINI)
          }))
        });
      } catch (e) { console.error('Hayvan dosya parse hatası:', e.message); }
    }

    // Parsel dosyaları
    for (const file of (req.files.parselListesi || [])) {
      try {
        const headers = getExcelHeaders(file.path);
        sonuc.parsel.push({
          dosyaAdi: file.originalname,
          dosyaYolu: file.path,
          tur: 'parsel',
          sheetler: Object.keys(headers).map(s => ({
            isim: s, headers: headers[s],
            tahmin: kolonEslestirmeTahmin(headers[s] || [], PARSEL_KOLON_TAHMINI)
          }))
        });
      } catch (e) { console.error('Parsel dosya parse hatası:', e.message); }
    }

    // Görevli dosyaları
    for (const file of (req.files.gorevliListesi || [])) {
      try {
        const headers = getExcelHeaders(file.path);
        sonuc.gorevli.push({
          dosyaAdi: file.originalname,
          dosyaYolu: file.path,
          tur: 'gorevli',
          sheetler: Object.keys(headers).map(s => ({
            isim: s, headers: headers[s],
            tahmin: kolonEslestirmeTahmin(headers[s] || [], GOREVLI_KOLON_TAHMINI)
          }))
        });
      } catch (e) { console.error('Görevli dosya parse hatası:', e.message); }
    }

    // CSV metin işleme
    if (req.body.hayvanCsv && req.body.hayvanCsv.trim()) {
      const tmpPath = path.join(__dirname, '../../uploads/temp', `csv_hayvan_${Date.now()}.csv`);
      fs.writeFileSync(tmpPath, req.body.hayvanCsv);
      try {
        const headers = getExcelHeaders(tmpPath);
        const ilkSheet = Object.keys(headers)[0];
        sonuc.hayvan.push({
          dosyaAdi: 'yapistirilan_hayvan.csv',
          dosyaYolu: tmpPath,
          tur: 'hayvan',
          sheetler: [{ isim: ilkSheet, headers: headers[ilkSheet], tahmin: kolonEslestirmeTahmin(headers[ilkSheet] || [], HAYVAN_KOLON_TAHMINI) }]
        });
      } catch (e) { console.error('CSV parse hatası:', e.message); }
    }

    if (req.body.parselCsv && req.body.parselCsv.trim()) {
      const tmpPath = path.join(__dirname, '../../uploads/temp', `csv_parsel_${Date.now()}.csv`);
      fs.writeFileSync(tmpPath, req.body.parselCsv);
      try {
        const headers = getExcelHeaders(tmpPath);
        const ilkSheet = Object.keys(headers)[0];
        sonuc.parsel.push({
          dosyaAdi: 'yapistirilan_parsel.csv',
          dosyaYolu: tmpPath,
          tur: 'parsel',
          sheetler: [{ isim: ilkSheet, headers: headers[ilkSheet], tahmin: kolonEslestirmeTahmin(headers[ilkSheet] || [], PARSEL_KOLON_TAHMINI) }]
        });
      } catch (e) { console.error('CSV parse hatası:', e.message); }
    }

    if (req.body.gorevliCsv && req.body.gorevliCsv.trim()) {
      const tmpPath = path.join(__dirname, '../../uploads/temp', `csv_gorevli_${Date.now()}.csv`);
      fs.writeFileSync(tmpPath, req.body.gorevliCsv);
      try {
        const headers = getExcelHeaders(tmpPath);
        const ilkSheet = Object.keys(headers)[0];
        sonuc.gorevli.push({
          dosyaAdi: 'yapistirilan_gorevli.csv',
          dosyaYolu: tmpPath,
          tur: 'gorevli',
          sheetler: [{ isim: ilkSheet, headers: headers[ilkSheet], tahmin: kolonEslestirmeTahmin(headers[ilkSheet] || [], GOREVLI_KOLON_TAHMINI) }]
        });
      } catch (e) { console.error('CSV parse hatası:', e.message); }
    }

    req.session.bekleyenDosyalar = sonuc;
    req.session.projeId = req.params.projeId;

    res.json({ success: true, data: sonuc });
  } catch (err) {
    console.error('Upload hatası:', err);
    res.status(500).json({ error: err.message });
  }
});

// Eşleştirme onayı ve veritabanına kayıt
router.post('/:projeId/kaydet', async (req, res) => {
  try {
    const projeId = req.params.projeId;
    const proje = await Proje.findById(projeId);
    if (!proje) return res.status(404).json({ error: 'Proje bulunamadı' });

    let eslestirmeObj;
    try {
      const raw = req.body.eslestirmeler;
      eslestirmeObj = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch (e) {
      return res.status(400).json({ error: 'Geçersiz eşleştirme verisi: ' + e.message });
    }

    const hatalar = [];
    let hayvanKayit = 0, parselKayit = 0, gorevliKayit = 0;

    // Hayvan verileri
    if ((eslestirmeObj.hayvan || []).length > 0) {
      await Hayvan.deleteMany({ projeId });
      for (const item of eslestirmeObj.hayvan) {
        try {
          const veriler = parseExcel(item.dosyaYolu);
          const sheet = item.sheetIsim || Object.keys(veriler)[0];
          const rows = veriler[sheet] || [];

          const hayvanlar = veriDonustur(rows, item.eslestirme, 'hayvan')
            .filter(h => h.kupeNo)
            .map(h => ({
              projeId,
              kupeNo:        h.kupeNo,
              tur:           h.tur || 'sığır',
              irk:           h.irk || '',
              cinsiyet:      h.cinsiyet || '',
              dogumTarihi:   h.dogumTarihi || null,
              isletmeSahibi: h.isletmeSahibi || h.isletmeSahibiKisiFirma || '',
              isletme:       h.isletme || h.bulunduguIsletme || '',
              mahalle:       h.mahalle || '',
              firmaFlag:     firmaDetect(h.isletmeSahibi || h.isletmeSahibiKisiFirma || ''),
              bbhbKatsayi:   bbhbKatsayiHesapla(h.tur, h.cinsiyet, h.dogumTarihi, h.irk),
              kaynak:        'excel'
            }));

          if (hayvanlar.length > 0) {
            await Hayvan.insertMany(hayvanlar, { ordered: false });
            hayvanKayit += hayvanlar.length;
          }
        } catch (e) {
          hatalar.push(`Hayvan: ${e.message}`);
        }
      }
    }

    // Parsel verileri
    if ((eslestirmeObj.parsel || []).length > 0) {
      await Parsel.deleteMany({ projeId });
      for (const item of eslestirmeObj.parsel) {
        try {
          const veriler = parseExcel(item.dosyaYolu);
          const sheet = item.sheetIsim || Object.keys(veriler)[0];
          const rows = veriler[sheet] || [];

          const parseller = veriDonustur(rows, item.eslestirme, 'parsel')
            .filter(p => p.parselNo)
            .map(p => ({ ...p, projeId, kaynak: 'excel' }));

          if (parseller.length > 0) {
            await Parsel.insertMany(parseller, { ordered: false });
            parselKayit += parseller.length;
          }
        } catch (e) {
          hatalar.push(`Parsel: ${e.message}`);
        }
      }
    }

    // Görevli verileri — bağımsız olarak çalışır
    if ((eslestirmeObj.gorevli || []).length > 0) {
      await Gorevli.deleteMany({ projeId });
      for (const item of eslestirmeObj.gorevli) {
        try {
          const veriler = parseExcel(item.dosyaYolu);
          const sheet = item.sheetIsim || Object.keys(veriler)[0];
          const rows = veriler[sheet] || [];

          const gorevliler = veriDonustur(rows, item.eslestirme, 'gorevli')
            .filter(g => g.adSoyad)
            .map((g, i) => ({ ...g, projeId, sira: i, kaynak: 'excel' }));

          if (gorevliler.length > 0) {
            await Gorevli.insertMany(gorevliler, { ordered: false });
            gorevliKayit += gorevliler.length;
          }
        } catch (e) {
          hatalar.push(`Görevli: ${e.message}`);
        }
      }
    }

    // Mahalle listesini güncelle
    const mahalleler = await Hayvan.distinct('mahalle', { projeId });
    const parselMahalleler = await Parsel.distinct('mahalle', { projeId });
    const tumMahalleler = [...new Set([...mahalleler, ...parselMahalleler])].filter(Boolean);
    if (tumMahalleler.length > 0) {
      await Proje.findByIdAndUpdate(projeId, { mahalleler: tumMahalleler });
    }

    // İşletme sahipleri listesi (firma flag'leri ile)
    const sahipListesi = await Hayvan.aggregate([
      { $match: { projeId: require('mongoose').Types.ObjectId.createFromHexString(projeId) } },
      { $group: { _id: '$isletmeSahibi', firmaFlag: { $first: '$firmaFlag' }, hayvanSayisi: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      mesaj: `${hayvanKayit} hayvan, ${parselKayit} parsel, ${gorevliKayit} görevli kaydedildi.`,
      hayvanKayit, parselKayit, gorevliKayit,
      mahalleler: tumMahalleler,
      sahipListesi,
      hatalar: hatalar.length > 0 ? hatalar : undefined
    });
  } catch (err) {
    console.error('Kayıt hatası:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

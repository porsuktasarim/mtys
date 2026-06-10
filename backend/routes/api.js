const express = require('express');
const router = express.Router();
const Hayvan = require('../models/Hayvan');
const Parsel = require('../models/Parsel');
const Gorevli = require('../models/Gorevli');
const Hesaplama = require('../models/Hesaplama');
const { BBHB_KATSAYILARI } = require('../utils/bbhb');

// BBHB katsayı tablosu
router.get('/bbhb-katsayilari', (req, res) => {
  res.json(BBHB_KATSAYILARI);
});

// Proje mahallelerini getir
router.get('/projeler/:projeId/mahalleler', async (req, res) => {
  try {
    const { projeId } = req.params;
    const h = await Hayvan.distinct('mahalle', { projeId });
    const p = await Parsel.distinct('mahalle', { projeId });
    const mahalleler = [...new Set([...h, ...p])].filter(Boolean).sort();
    res.json(mahalleler);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Hayvan listesi
router.get('/projeler/:projeId/hayvanlar', async (req, res) => {
  try {
    const { mahalle, page = 1, limit = 50 } = req.query;
    const filter = { projeId: req.params.projeId };
    if (mahalle) filter.mahalle = mahalle;
    const hayvanlar = await Hayvan.find(filter).limit(limit * 1).skip((page - 1) * limit);
    const toplam = await Hayvan.countDocuments(filter);
    res.json({ hayvanlar, toplam, sayfa: page, toplamSayfa: Math.ceil(toplam / limit) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Parsel verim durumu güncelle
router.patch('/parseller/:parselId/verim', async (req, res) => {
  try {
    const { verimDurumu } = req.body;
    const gecerli = ['çok iyi', 'iyi', 'orta', 'zayıf', ''];
    if (!gecerli.includes(verimDurumu)) {
      return res.status(400).json({ error: 'Geçersiz verim durumu' });
    }
    const parsel = await require('../models/Parsel').findByIdAndUpdate(
      req.params.parselId,
      { verimDurumu },
      { new: true }
    );
    if (!parsel) return res.status(404).json({ error: 'Parsel bulunamadı' });
    res.json({ success: true, parsel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Parsel listesi
router.get('/projeler/:projeId/parseller', async (req, res) => {
  try {
    const { mahalle } = req.query;
    const filter = { projeId: req.params.projeId };
    if (mahalle) filter.mahalle = mahalle;
    const parseller = await Parsel.find(filter).sort({ mahalle: 1, parselNo: 1 });
    res.json(parseller);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Görevli listesi
router.get('/projeler/:projeId/gorevliler', async (req, res) => {
  try {
    const gorevliler = await Gorevli.find({ projeId: req.params.projeId }).sort({ sira: 1 });
    res.json(gorevliler);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Hesaplama sonuçları
router.get('/projeler/:projeId/hesaplamalar', async (req, res) => {
  try {
    const hesaplamalar = await Hesaplama.find({ projeId: req.params.projeId }).sort({ mahalle: 1 });
    res.json(hesaplamalar);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Tek hesaplama detay
router.get('/hesaplamalar/:id', async (req, res) => {
  try {
    const h = await Hesaplama.findById(req.params.id);
    if (!h) return res.status(404).json({ error: 'Bulunamadı' });
    res.json(h);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// İstatistikler
router.get('/projeler/:projeId/istatistikler', async (req, res) => {
  try {
    const projeId = req.params.projeId;
    const [hayvanSayisi, parselSayisi, gorevliSayisi, hesaplamaSayisi] = await Promise.all([
      Hayvan.countDocuments({ projeId }),
      Parsel.countDocuments({ projeId }),
      Gorevli.countDocuments({ projeId }),
      Hesaplama.countDocuments({ projeId })
    ]);

    const turDagilim = await Hayvan.aggregate([
      { $match: { projeId: require('mongoose').Types.ObjectId.createFromHexString(projeId) } },
      { $group: { _id: '$tur', adet: { $sum: 1 } } },
      { $sort: { adet: -1 } }
    ]);

    const vasifDagilim = await Parsel.aggregate([
      { $match: { projeId: require('mongoose').Types.ObjectId.createFromHexString(projeId) } },
      { $group: { _id: '$araziVasfi', toplamAlan: { $sum: '$yuzolcumu' }, adet: { $sum: 1 } } }
    ]);

    res.json({ hayvanSayisi, parselSayisi, gorevliSayisi, hesaplamaSayisi, turDagilim, vasifDagilim });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

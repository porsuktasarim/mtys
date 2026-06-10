const express = require('express');
const router = express.Router();
const Proje = require('../models/Proje');
const Hayvan = require('../models/Hayvan');
const Parsel = require('../models/Parsel');
const Gorevli = require('../models/Gorevli');
const Hesaplama = require('../models/Hesaplama');

router.get('/', async (req, res, next) => {
  try {
    const projeler = await Proje.find().sort({ createdAt: -1 });
    res.render('projeler/liste', { title: 'Projeler', projeler });
  } catch (err) { next(err); }
});

router.get('/yeni', (req, res) => {
  res.render('projeler/yeni', { title: 'Yeni Proje', proje: null });
});

router.post('/', async (req, res, next) => {
  try {
    const { ad, il, ilce, yil, yagisKusagi, meraVasfi, otlatmaSuresi, aciklama } = req.body;
    const proje = new Proje({
      ad, il, ilce,
      yil: parseInt(yil) || new Date().getFullYear(),
      yagisKusagi: yagisKusagi || 'yarıkurak',
      meraVasfi:   meraVasfi   || 'orta',
      otlatmaSuresi: parseInt(otlatmaSuresi) || 180,
      aciklama: aciklama || ''
    });
    await proje.save();
    req.session.flash = { success: 'Proje başarıyla oluşturuldu.' };
    res.redirect(`/projeler/${proje._id}`);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const proje = await Proje.findById(req.params.id);
    if (!proje) return res.status(404).render('error', { title: '404', message: 'Proje bulunamadı.', code: 404 });

    const [hayvanSayisi, parselSayisi, gorevliSayisi] = await Promise.all([
      Hayvan.countDocuments({ projeId: proje._id }),
      Parsel.countDocuments({ projeId: proje._id }),
      Gorevli.countDocuments({ projeId: proje._id })
    ]);

    const hesaplamalar = await Hesaplama.find({ projeId: proje._id }).sort({ createdAt: -1 });
    const mahalleler = await Hayvan.distinct('mahalle', { projeId: proje._id });
    const parselMahalleler = await Parsel.distinct('mahalle', { projeId: proje._id });
    const tumMahalleler = [...new Set([...mahalleler, ...parselMahalleler])].filter(Boolean).sort();

    // İşletme sahipleri listesi (firma tespiti ile)
    const sahipListesi = await Hayvan.aggregate([
      { $match: { projeId: proje._id } },
      { $group: { _id: '$isletmeSahibi', firmaFlag: { $first: '$firmaFlag' }, hayvanSayisi: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Parsel listesi — verim durumu seçimi için
    const parseller = await Parsel.find({ projeId: proje._id }).sort({ mahalle: 1, parselNo: 1 });

    res.render('projeler/detay', {
      title: proje.ad, proje, hayvanSayisi, parselSayisi, gorevliSayisi,
      hesaplamalar, tumMahalleler, sahipListesi, parseller
    });
  } catch (err) { next(err); }
});

router.get('/:id/duzenle', async (req, res, next) => {
  try {
    const proje = await Proje.findById(req.params.id);
    if (!proje) return res.status(404).render('error', { title: '404', message: 'Proje bulunamadı.', code: 404 });
    res.render('projeler/yeni', { title: 'Proje Düzenle', proje });
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { ad, il, ilce, yil, yagisKusagi, meraVasfi, otlatmaSuresi, aciklama } = req.body;
    await Proje.findByIdAndUpdate(req.params.id, {
      ad, il, ilce,
      yil: parseInt(yil),
      yagisKusagi: yagisKusagi || 'yarıkurak',
      meraVasfi:   meraVasfi   || 'orta',
      otlatmaSuresi: parseInt(otlatmaSuresi) || 180,
      aciklama: aciklama || ''
    });
    req.session.flash = { success: 'Proje güncellendi.' };
    res.redirect(`/projeler/${req.params.id}`);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    await Promise.all([
      Proje.findByIdAndDelete(id),
      Hayvan.deleteMany({ projeId: id }),
      Parsel.deleteMany({ projeId: id }),
      Gorevli.deleteMany({ projeId: id }),
      Hesaplama.deleteMany({ projeId: id })
    ]);
    req.session.flash = { success: 'Proje ve tüm veriler silindi.' };
    res.redirect('/projeler');
  } catch (err) { next(err); }
});

module.exports = router;

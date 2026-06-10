const express = require('express');
const router = express.Router();
const Proje = require('../models/Proje');
const Hesaplama = require('../models/Hesaplama');

router.get('/', async (req, res) => {
  try {
    const projeler = await Proje.find().sort({ createdAt: -1 }).limit(5);
    const toplamProje = await Proje.countDocuments();
    const toplamHesap = await Hesaplama.countDocuments();
    res.render('index', { title: 'Ana Sayfa', projeler, toplamProje, toplamHesap });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

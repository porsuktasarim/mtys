const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Proje = require('../models/Proje');
const Hesaplama = require('../models/Hesaplama');
const { tumEkleriExportEt } = require('../utils/excelExport');

// Tek mahalle export
router.get('/:projeId/:mahalle', async (req, res, next) => {
  try {
    const { projeId, mahalle } = req.params;
    const proje = await Proje.findById(projeId);
    const hesaplama = await Hesaplama.findOne({ projeId, mahalle }).sort({ hesaplamaTarihi: -1 });

    if (!proje || !hesaplama) {
      return res.status(404).json({ error: 'Proje veya hesaplama bulunamadı.' });
    }

    const outputDir = 'uploads/output';
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const dosyaAdi = `${proje.il}_${proje.ilce}_${mahalle}_EkFormlar_${Date.now()}.xlsx`;
    const outputPath = path.join(outputDir, dosyaAdi);

    await tumEkleriExportEt(hesaplama.toObject(), proje.toObject(), outputPath);

    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(dosyaAdi)}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    const fileStream = fs.createReadStream(outputPath);
    fileStream.pipe(res);
    fileStream.on('end', () => {
      setTimeout(() => {
        try { fs.unlinkSync(outputPath); } catch (e) { }
      }, 5000);
    });
  } catch (err) {
    console.error('Export hatası:', err);
    next(err);
  }
});

// Tüm mahalleler için toplu export
router.get('/:projeId', async (req, res, next) => {
  try {
    const { projeId } = req.params;
    const proje = await Proje.findById(projeId);
    if (!proje) return res.status(404).json({ error: 'Proje bulunamadı.' });

    const hesaplamalar = await Hesaplama.find({ projeId }).sort({ mahalle: 1 });
    if (hesaplamalar.length === 0) {
      return res.status(400).json({ error: 'Henüz hesaplama yapılmamış.' });
    }

    const outputDir = 'uploads/output';
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const ExcelJS = require('exceljs');
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Mera Kanunu Uygulaması';
    wb.created = new Date();

    // Her mahalle için ayrı sayfa grubu
    for (const hesaplama of hesaplamalar) {
      const { tumEkleriExportEt: _, ...exportFns } = require('../utils/excelExport');
      const { ek4aOlustur, ek4bOlustur, ek4cOlustur, ek7Olustur, ek7aOlustur, ek7bOlustur, ek7cOlustur, ek7fOlustur, ek8Olustur, ek9Olustur, ek10Olustur } = require('../utils/excelExport');
      const h = hesaplama.toObject();
      const p = proje.toObject();
      ek4aOlustur(wb, h, p);
      ek4bOlustur(wb, h, p);
      ek4cOlustur(wb, h, p);
      ek7Olustur(wb, h, p);
      ek7aOlustur(wb, h, p);
      ek7bOlustur(wb, h, p);
      ek7cOlustur(wb, h, p);
      ek7fOlustur(wb, h, p);
      ek8Olustur(wb, h, p);
      ek10Olustur(wb, h, p);
    }

    const dosyaAdi = `${proje.il}_${proje.ilce}_TumMahalleler_EkFormlar_${Date.now()}.xlsx`;
    const outputPath = path.join(outputDir, dosyaAdi);
    await wb.xlsx.writeFile(outputPath);

    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(dosyaAdi)}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    const fileStream = fs.createReadStream(outputPath);
    fileStream.pipe(res);
    fileStream.on('end', () => {
      setTimeout(() => { try { fs.unlinkSync(outputPath); } catch (e) { } }, 5000);
    });
  } catch (err) {
    console.error('Toplu export hatası:', err);
    next(err);
  }
});

module.exports = router;

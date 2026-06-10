const ExcelJS = require('exceljs');
const path = require('path');

const STIL = {
  baslik: {
    font: { bold: true, size: 11, name: 'Times New Roman' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A5276' } },
    alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
    border: {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    },
    font2: { bold: true, size: 11, color: { argb: 'FFFFFFFF' }, name: 'Times New Roman' }
  },
  altBaslik: {
    font: { bold: true, size: 10, name: 'Times New Roman' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD5E8D4' } },
    alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
    border: {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    }
  },
  veri: {
    font: { size: 10, name: 'Times New Roman' },
    alignment: { horizontal: 'left', vertical: 'middle', wrapText: true },
    border: {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    }
  },
  veriMerkez: {
    font: { size: 10, name: 'Times New Roman' },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    }
  },
  toplam: {
    font: { bold: true, size: 10, name: 'Times New Roman' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'medium' }, left: { style: 'thin' },
      bottom: { style: 'medium' }, right: { style: 'thin' }
    }
  }
};

function satırStilUygula(row, stilTipi = 'veri') {
  const s = STIL[stilTipi];
  row.eachCell({ includeEmpty: true }, cell => {
    if (s.font) cell.font = stilTipi === 'baslik' ? STIL.baslik.font2 : s.font;
    if (s.fill) cell.fill = s.fill;
    if (s.alignment) cell.alignment = s.alignment;
    if (s.border) cell.border = s.border;
  });
}

function ustBilgiEkle(ws, proje, mahalle, ekNo) {
  ws.addRow([]);
  const r1 = ws.addRow([`T.C. TARIM VE ORMAN BAKANLIĞI`]);
  r1.font = { bold: true, size: 12, name: 'Times New Roman' };
  r1.alignment = { horizontal: 'center' };
  ws.mergeCells(`A${ws.rowCount}:J${ws.rowCount}`);

  const r2 = ws.addRow([`${proje.il} İli ${proje.ilce} İlçesi - ${mahalle} Köyü/Mahallesi`]);
  r2.font = { bold: true, size: 11, name: 'Times New Roman' };
  r2.alignment = { horizontal: 'center' };
  ws.mergeCells(`A${ws.rowCount}:J${ws.rowCount}`);

  const r3 = ws.addRow([`MERA, YAYLAK VE KIŞLAKLARIN TESPİT, TAHDİT VE TAHSİS ÇALIŞMALARI - ${ekNo}`]);
  r3.font = { bold: true, size: 11, name: 'Times New Roman' };
  r3.alignment = { horizontal: 'center' };
  ws.mergeCells(`A${ws.rowCount}:J${ws.rowCount}`);
  ws.addRow([]);
}

/**
 * EK 4/A - BBHB Hesabı
 */
function ek4aOlustur(wb, hesaplama, proje) {
  const ws = wb.addWorksheet('Ek 4-a BBHB Hesabı');
  ws.pageSetup = { orientation: 'landscape', paperSize: 9, fitToPage: true };

  ustBilgiEkle(ws, proje, hesaplama.mahalle, 'EK 4/A - BBHB HESABI');

  const baslikSatiri = ws.addRow([
    'Sıra No', 'TC Kimlik No', 'Çiftçi Adı Soyadı', 'İşletme',
    'Hayvan Türü', 'Adet', 'BBHB Katsayısı', 'BBHB',
    'Toplam BBHB', 'Açıklamalar'
  ]);
  baslikSatiri.height = 30;
  satırStilUygula(baslikSatiri, 'baslik');
  ws.getRow(ws.rowCount).font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' }, name: 'Times New Roman' };

  ws.columns = [
    { width: 8 }, { width: 15 }, { width: 25 }, { width: 20 },
    { width: 15 }, { width: 8 }, { width: 12 }, { width: 12 },
    { width: 12 }, { width: 20 }
  ];

  let siraNo = 1;
  const ek4a = hesaplama.ek4a || {};
  (ek4a.ciftciler || []).forEach(ciftci => {
    const ilkSatir = ws.rowCount + 1;
    (ciftci.hayvanlar || []).forEach((hGrubu, idx) => {
      const row = ws.addRow([
        idx === 0 ? siraNo : '',
        idx === 0 ? ciftci.tcKimlikNo : '',
        idx === 0 ? ciftci.adSoyad : '',
        idx === 0 ? (ciftci.isletme || '') : '',
        hGrubu.tur,
        hGrubu.adet,
        hGrubu.katsayi.toFixed(2),
        hGrubu.toplamBBHB.toFixed(4),
        idx === 0 ? ciftci.toplamBBHB.toFixed(4) : '',
        ''
      ]);
      satırStilUygula(row, 'veri');
      row.height = 18;
    });

    // Toplam satırı birleştir
    if ((ciftci.hayvanlar || []).length > 1) {
      const sonSatir = ws.rowCount;
      ws.mergeCells(`A${ilkSatir}:A${sonSatir}`);
      ws.mergeCells(`B${ilkSatir}:B${sonSatir}`);
      ws.mergeCells(`C${ilkSatir}:C${sonSatir}`);
      ws.mergeCells(`D${ilkSatir}:D${sonSatir}`);
      ws.mergeCells(`I${ilkSatir}:I${sonSatir}`);
      ws.mergeCells(`J${ilkSatir}:J${sonSatir}`);
    }
    siraNo++;
  });

  // Genel Toplam
  const toplamRow = ws.addRow([
    '', '', '', 'GENEL TOPLAM', '', '', '', '',
    (ek4a.genelToplamBBHB || 0).toFixed(4), ''
  ]);
  satırStilUygula(toplamRow, 'toplam');
  ws.mergeCells(`A${ws.rowCount}:C${ws.rowCount}`);
  ws.mergeCells(`E${ws.rowCount}:H${ws.rowCount}`);

  return ws;
}

/**
 * EK 4/B - Mera Kapasitesi
 */
function ek4bOlustur(wb, hesaplama, proje) {
  const ws = wb.addWorksheet('Ek 4-b Mera Kapasitesi');
  ws.pageSetup = { orientation: 'landscape', paperSize: 9 };

  ustBilgiEkle(ws, proje, hesaplama.mahalle, 'EK 4/B - TOPLAM MERA-ÇAYIR VARLIĞI VE KAPASİTESİ');

  const baslikSatiri = ws.addRow([
    'Sıra No', 'Ada No', 'Parsel No', 'Mevkii',
    'Arazi Vasfı', 'Alan (Dekar)', 'Kapasite (BBHB)', 'Açıklamalar'
  ]);
  baslikSatiri.height = 30;
  satırStilUygula(baslikSatiri, 'baslik');
  ws.getRow(ws.rowCount).font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' }, name: 'Times New Roman' };

  ws.columns = [
    { width: 8 }, { width: 12 }, { width: 12 }, { width: 20 },
    { width: 15 }, { width: 14 }, { width: 14 }, { width: 20 }
  ];

  const ek4b = hesaplama.ek4b || {};
  (ek4b.parseller || []).forEach((p, i) => {
    const row = ws.addRow([
      i + 1, p.adaNo || '-', p.parselNo || p.adaParsel,
      p.mevkii || '-', p.vasfi || p.araziVasfi,
      Number(p.alan || p.yuzolcumu || 0).toFixed(2),
      Number(p.kapasite || 0).toFixed(4),
      ''
    ]);
    satırStilUygula(row, 'veri');
    row.height = 18;
  });

  // Özet satırlar
  ws.addRow([]);
  const mera = ws.addRow(['', '', '', 'Mera Alanı Toplamı', '', (ek4b.meraAlani || 0).toFixed(2), '', '']);
  satırStilUygula(mera, 'altBaslik');
  const cayir = ws.addRow(['', '', '', 'Çayır Alanı Toplamı', '', (ek4b.cayirAlani || 0).toFixed(2), '', '']);
  satırStilUygula(cayir, 'altBaslik');
  const yaylak = ws.addRow(['', '', '', 'Yaylak Alanı Toplamı', '', (ek4b.yaylakAlani || 0).toFixed(2), '', '']);
  satırStilUygula(yaylak, 'altBaslik');
  const kislak = ws.addRow(['', '', '', 'Kışlak Alanı Toplamı', '', (ek4b.kislakAlani || 0).toFixed(2), '', '']);
  satırStilUygula(kislak, 'altBaslik');

  const toplamRow = ws.addRow([
    '', '', '', 'GENEL TOPLAM', '',
    (ek4b.toplamAlan || 0).toFixed(2),
    (ek4b.toplamKapasite || 0).toFixed(4), ''
  ]);
  satırStilUygula(toplamRow, 'toplam');

  return ws;
}

/**
 * EK 4/C - Karşılaştırma
 */
function ek4cOlustur(wb, hesaplama, proje) {
  const ws = wb.addWorksheet('Ek 4-c Karşılaştırma');
  ws.pageSetup = { orientation: 'portrait', paperSize: 9 };

  ustBilgiEkle(ws, proje, hesaplama.mahalle, 'EK 4/C - HAYVAN VARLIĞI İLE MERA KAPASİTESİNİN KARŞILAŞTIRILMASI');

  ws.columns = [{ width: 35 }, { width: 20 }, { width: 20 }];

  const baslikSatiri = ws.addRow(['Parametre', 'Değer (BBHB)', 'Açıklama']);
  baslikSatiri.height = 30;
  satırStilUygula(baslikSatiri, 'baslik');
  ws.getRow(ws.rowCount).font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' }, name: 'Times New Roman' };

  const ek4c = hesaplama.ek4c || {};
  const rows = [
    ['Mevcut Hayvan Varlığı (BBHB)', (ek4c.mevcutBBHB || 0).toFixed(4), 'Ek 4/A\'dan'],
    ['Mera-Çayır Kapasitesi (BBHB)', (ek4c.kapasiteBBHB || 0).toFixed(4), 'Ek 4/B\'den'],
    ['Fark (Kapasite - Mevcut)', (ek4c.fark || 0).toFixed(4),
      ek4c.durum === 'fazla' ? '⚠ Kapasite Fazlası' :
        ek4c.durum === 'açık' ? '✓ Kapasite Açığı' : '✓ Dengeli']
  ];

  rows.forEach(r => {
    const row = ws.addRow(r);
    satırStilUygula(row, 'veri');
    row.height = 25;
  });

  // Sonuç kutusu
  ws.addRow([]);
  const sonucRow = ws.addRow([
    `SONUÇ: ${hesaplama.mahalle} köyü/mahallesi için mera kapasitesi durumu: ${
      (ek4c.durum === 'fazla') ? 'KAPASİTE FAZLASI - Mera alanı mevcut hayvan varlığını karşılamaktadır.' :
        (ek4c.durum === 'açık') ? 'KAPASİTE AÇIĞI - Mevcut hayvan varlığı mera kapasitesini aşmaktadır.' :
          'DENGELİ - Mevcut hayvan varlığı mera kapasitesiyle dengeli.'
    }`, '', ''
  ]);
  sonucRow.height = 40;
  ws.mergeCells(`A${ws.rowCount}:C${ws.rowCount}`);
  sonucRow.getCell(1).font = { bold: true, size: 11, name: 'Times New Roman' };
  sonucRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  sonucRow.getCell(1).fill = {
    type: 'pattern', pattern: 'solid',
    fgColor: { argb: ek4c.durum === 'açık' ? 'FFFDE8E8' : 'FFE8F5E9' }
  };
  sonucRow.getCell(1).border = STIL.veri.border;

  return ws;
}

/**
 * EK 7 - Çiftçi Aileleri Listesi
 */
function ek7Olustur(wb, hesaplama, proje) {
  const ws = wb.addWorksheet('Ek 7 Çiftçi Listesi');
  ws.pageSetup = { orientation: 'portrait', paperSize: 9 };

  ustBilgiEkle(ws, proje, hesaplama.mahalle, 'EK 7 - KÖY/MAHALLE BAZINDA ÇİFTÇİ AİLELERİ LİSTESİ');

  ws.columns = [
    { width: 8 }, { width: 25 }, { width: 16 }, { width: 14 }, { width: 12 }, { width: 20 }
  ];

  const baslikSatiri = ws.addRow([
    'Sıra No', 'Adı Soyadı', 'TC Kimlik No', 'BBHB', 'Hayvan Sayısı', 'Açıklamalar'
  ]);
  baslikSatiri.height = 30;
  satırStilUygula(baslikSatiri, 'baslik');
  ws.getRow(ws.rowCount).font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' }, name: 'Times New Roman' };

  const ek7 = hesaplama.ek7 || {};
  (ek7.ciftciler || []).forEach(c => {
    const row = ws.addRow([c.siraNo, c.adSoyad, c.tcKimlikNo, Number(c.bbhb || 0).toFixed(4), c.hayvanSayisi || 0, '']);
    satırStilUygula(row, 'veri');
    row.height = 20;
  });

  const toplamRow = ws.addRow([
    '', 'TOPLAM', '',
    (ek7.ciftciler || []).reduce((s, c) => s + (c.bbhb || 0), 0).toFixed(4),
    (ek7.ciftciler || []).reduce((s, c) => s + (c.hayvanSayisi || 0), 0), ''
  ]);
  satırStilUygula(toplamRow, 'toplam');

  return ws;
}

/**
 * EK 7/A - Genel Bilgiler
 */
function ek7aOlustur(wb, hesaplama, proje) {
  const ws = wb.addWorksheet('Ek 7-a Genel Bilgiler');
  ws.pageSetup = { orientation: 'portrait', paperSize: 9 };

  ustBilgiEkle(ws, proje, hesaplama.mahalle, 'EK 7/A - TAHSİS YAPILACAK KÖY/MAHALLENİN GENEL BİLGİLERİ');

  ws.columns = [{ width: 30 }, { width: 40 }];

  const bilgiler = [
    ['İl', proje.il],
    ['İlçe', proje.ilce],
    ['Köy / Mahalle', hesaplama.mahalle],
    ['Çalışma Yılı', proje.yil],
    ['Toplam Mera-Çayır Alanı (Dekar)', (hesaplama.ek4b?.toplamAlan || 0).toFixed(2)],
    ['Toplam Kapasite (BBHB)', (hesaplama.ek4b?.toplamKapasite || 0).toFixed(4)],
    ['Mevcut Hayvan Varlığı (BBHB)', (hesaplama.ek4a?.genelToplamBBHB || 0).toFixed(4)],
    ['Toplam Çiftçi Sayısı', (hesaplama.ek7?.ciftciler || []).length],
    ['Kapasite Fazlası/Açığı (BBHB)', (hesaplama.ek4c?.fark || 0).toFixed(4)],
    ['Kapasite Durumu', hesaplama.ek4c?.durum === 'fazla' ? 'Kapasite Fazlası' :
      hesaplama.ek4c?.durum === 'açık' ? 'Kapasite Açığı' : 'Dengeli'],
    ['Mera Kapasitesi Sabiti (BBHB/Dekar)', proje.meraKapasiteSabitiBBHB || 2.0],
    ['Hesaplama Tarihi', new Date(hesaplama.hesaplamaTarihi).toLocaleDateString('tr-TR')]
  ];

  bilgiler.forEach(([baslik, deger]) => {
    const row = ws.addRow([baslik, String(deger || '')]);
    row.getCell(1).font = { bold: true, size: 10, name: 'Times New Roman' };
    row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F3F4' } };
    row.getCell(2).font = { size: 10, name: 'Times New Roman' };
    row.eachCell(cell => { cell.border = STIL.veri.border; });
    row.height = 22;
  });

  return ws;
}

/**
 * EK 7/B - Parsel Listesi
 */
function ek7bOlustur(wb, hesaplama, proje) {
  const ws = wb.addWorksheet('Ek 7-b Parsel Listesi');
  ws.pageSetup = { orientation: 'landscape', paperSize: 9 };

  ustBilgiEkle(ws, proje, hesaplama.mahalle, 'EK 7/B - MERA, YAYLAK, KIŞLAK PARSEL LİSTESİ VE ALAN DÖKÜMÜ');

  ws.columns = [
    { width: 8 }, { width: 12 }, { width: 12 }, { width: 20 }, { width: 15 },
    { width: 14 }, { width: 14 }, { width: 14 }, { width: 20 }
  ];

  const baslikSatiri = ws.addRow([
    'Sıra No', 'Ada No', 'Parsel No', 'Mevkii', 'Arazi Vasfı',
    'Toplam Alan (Da)', 'Fiilen Kullanılan (Da)', 'Kapasite (BBHB)', 'Açıklamalar'
  ]);
  baslikSatiri.height = 30;
  satırStilUygula(baslikSatiri, 'baslik');
  ws.getRow(ws.rowCount).font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' }, name: 'Times New Roman' };

  const ek4b = hesaplama.ek4b || {};
  (ek4b.parseller || []).forEach((p, i) => {
    const row = ws.addRow([
      i + 1, p.adaNo || '-', p.parselNo || p.adaParsel || '-',
      p.mevkii || '-', p.vasfi || p.araziVasfi,
      Number(p.alan || p.yuzolcumu || 0).toFixed(2),
      Number(p.alan || p.yuzolcumu || 0).toFixed(2),
      Number(p.kapasite || 0).toFixed(4), ''
    ]);
    satırStilUygula(row, 'veri');
    row.height = 18;
  });

  const toplamRow = ws.addRow([
    '', '', '', '', 'TOPLAM',
    (ek4b.toplamAlan || 0).toFixed(2),
    (ek4b.toplamAlan || 0).toFixed(2),
    (ek4b.toplamKapasite || 0).toFixed(4), ''
  ]);
  satırStilUygula(toplamRow, 'toplam');

  return ws;
}

/**
 * EK 7/C - Çiftçi Hayvan Varlığı Tablosu (Resmi Format)
 */
function ek7cOlustur(wb, hesaplama, proje) {
  const ws = wb.addWorksheet('Ek 7-c Hayvan Varlığı');
  ws.pageSetup = { orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1 };

  ustBilgiEkle(ws, proje, hesaplama.mahalle, 'EK 7/C - ÇİFTÇİ AİLELERİNİN HAYVAN VARLIĞI');

  const ek7c = hesaplama.ek7c || {};
  const sutunlar = ek7c.sutunlar || [];
  const ciftciler = ek7c.ciftciler || [];
  const toplam = ek7c.toplam || {};

  // Sütun genişlikleri: sıra, adSoyad, 16 hayvan sütunu, bbhb
  const kolonGenislikler = [{ width: 6 }, { width: 28 }];
  sutunlar.forEach(() => kolonGenislikler.push({ width: 9 }));
  kolonGenislikler.push({ width: 10 });
  ws.columns = kolonGenislikler;

  // Satır 1: Grup başlıkları (birleşik hücreler)
  const gruplar = [
    { label: '', span: 2 },
    { label: 'Kültür', span: 2 },
    { label: 'Kültür Melezi', span: 2 },
    { label: 'Yerli', span: 2 },
    { label: 'Küçükbaş', span: 3 },
    { label: 'Manda', span: 2 },
    { label: 'Erkek Sığır', span: 2 },
    { label: 'Diğer', span: 3 },
    { label: '', span: 1 },
  ];

  const grupSatiri = ws.addRow([]);
  grupSatiri.height = 20;
  let colIdx = 1;
  gruplar.forEach(g => {
    if (g.label) {
      const cell = grupSatiri.getCell(colIdx);
      cell.value = g.label;
      cell.font = { bold: true, size: 9, name: 'Times New Roman' };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B4332' } };
      cell.font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' }, name: 'Times New Roman' };
      if (g.span > 1) {
        ws.mergeCells(ws.rowCount, colIdx, ws.rowCount, colIdx + g.span - 1);
      }
    }
    colIdx += g.span;
  });

  // Satır 2: Alt başlıklar
  const altBasliklar = ['Sıra No', 'Adı Soyadı / Çiftçi Ailesi'];
  sutunlar.forEach(s => altBasliklar.push(s.label));
  altBasliklar.push('BBHB TOPLAM');
  const altBaslikSatiri = ws.addRow(altBasliklar);
  altBaslikSatiri.height = 35;
  altBaslikSatiri.eachCell(cell => {
    cell.font = { bold: true, size: 8, name: 'Times New Roman' };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D6A4F' } };
    cell.font = { bold: true, size: 8, color: { argb: 'FFFFFFFF' }, name: 'Times New Roman' };
    cell.border = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' }
    };
  });

  // Satır 3: Katsayı satırı
  const katsayiRow = ['', 'Katsayı →'];
  sutunlar.forEach(s => katsayiRow.push(s.katsayi.toFixed(2)));
  katsayiRow.push('');
  const katsayiSatiri = ws.addRow(katsayiRow);
  katsayiSatiri.height = 18;
  katsayiSatiri.eachCell(cell => {
    cell.font = { italic: true, size: 8, color: { argb: 'FF555555' }, name: 'Times New Roman' };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FAF4' } };
    cell.border = { bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } } };
  });

  // Veri satırları
  ciftciler.forEach((c, i) => {
    const rowData = [c.siraNo, c.adSoyad];
    sutunlar.forEach(s => rowData.push(c[s.key] || 0));
    rowData.push(c.bbhbToplam.toFixed(2));
    const dataRow = ws.addRow(rowData);
    dataRow.height = 18;
    dataRow.eachCell((cell, colNumber) => {
      cell.font = { size: 9, name: 'Times New Roman' };
      cell.alignment = { horizontal: colNumber <= 2 ? 'left' : 'center', vertical: 'middle' };
      cell.fill = {
        type: 'pattern', pattern: 'solid',
        fgColor: { argb: i % 2 === 0 ? 'FFFFFFFF' : 'FFF9FFF9' }
      };
      cell.border = {
        top: { style: 'hair' }, bottom: { style: 'hair' },
        left: { style: 'thin' }, right: { style: 'thin' }
      };
    });
    // BBHB sütununu kalın yap
    const bbhbCell = dataRow.getCell(rowData.length);
    bbhbCell.font = { bold: true, size: 9, name: 'Times New Roman' };
    bbhbCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
  });

  // Toplam satırı
  const toplamData = ['', 'TOPLAM'];
  sutunlar.forEach(s => toplamData.push(toplam[s.key] || 0));
  toplamData.push(toplam.bbhbToplam ? toplam.bbhbToplam.toFixed(2) : '0.00');
  const toplamSatiri = ws.addRow(toplamData);
  toplamSatiri.height = 22;
  toplamSatiri.eachCell(cell => {
    cell.font = { bold: true, size: 9, name: 'Times New Roman' };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B4332' } };
    cell.font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' }, name: 'Times New Roman' };
    cell.border = {
      top: { style: 'medium' }, bottom: { style: 'medium' },
      left: { style: 'thin' }, right: { style: 'thin' }
    };
  });

  // Görevliler bölümü
  ws.addRow([]);
  ws.addRow([]);
  const gorevliBaslik = ws.addRow(['', 'KOMİSYON ÜYELERİ', '', 'Sıra No', 'Adı Soyadı', 'Unvanı', 'Görevi', 'İmzası']);
  gorevliBaslik.getCell(2).font = { bold: true, size: 10, name: 'Times New Roman' };

  (ek7c.gorevliler || []).forEach((g, i) => {
    const gRow = ws.addRow(['', '', '', i + 1, g.adSoyad, g.unvan, g.gorev || '', '']);
    gRow.height = 25;
    [4,5,6,7,8].forEach(ci => {
      const cell = gRow.getCell(ci);
      cell.border = { bottom: { style: 'thin' } };
      cell.font = { size: 9, name: 'Times New Roman' };
    });
  });

  ws.addRow([]);
  const tarihRow = ws.addRow(['', '', '', '', '', '', 'Tarih:', new Date().toLocaleDateString('tr-TR')]);
  tarihRow.font = { bold: true, size: 9, name: 'Times New Roman' };

  return ws;
}

/**
 * EK 7/F - Tahsis Kararı
 */
function ek7fOlustur(wb, hesaplama, proje) {
  const ws = wb.addWorksheet('Ek 7-f Tahsis Kararı');
  ws.pageSetup = { orientation: 'landscape', paperSize: 9 };

  ustBilgiEkle(ws, proje, hesaplama.mahalle, 'EK 7/F - TAHSİS KARARI ÖZET TABLOSU');

  ws.columns = [
    { width: 8 }, { width: 25 }, { width: 15 }, { width: 15 }, { width: 15 },
    { width: 15 }, { width: 15 }, { width: 20 }
  ];

  const baslikSatiri = ws.addRow([
    'Sıra No', 'Çiftçi Adı Soyadı', 'TC Kimlik No',
    'Hayvan Varlığı (BBHB)', 'Mera Payı (BBHB)', 'Tahsis Alanı (Da)',
    'Pay Oranı (%)', 'Açıklamalar'
  ]);
  baslikSatiri.height = 30;
  satırStilUygula(baslikSatiri, 'baslik');
  ws.getRow(ws.rowCount).font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' }, name: 'Times New Roman' };

  const ek7 = hesaplama.ek7 || {};
  const ek4c = hesaplama.ek4c || {};
  const toplamBBHB = ek4a_toplamBBHB(hesaplama);
  const toplamAlan = hesaplama.ek4b?.toplamAlan || 0;

  let siraNo = 1;
  (ek7.ciftciler || []).forEach(c => {
    const pay = toplamBBHB > 0 ? (c.bbhb / toplamBBHB) * 100 : 0;
    const tahsisAlan = toplamBBHB > 0 ? (c.bbhb / toplamBBHB) * toplamAlan : 0;
    const row = ws.addRow([
      siraNo++, c.adSoyad, c.tcKimlikNo,
      Number(c.bbhb || 0).toFixed(4),
      Number(c.bbhb || 0).toFixed(4),
      tahsisAlan.toFixed(2),
      pay.toFixed(2), ''
    ]);
    satırStilUygula(row, 'veri');
    row.height = 20;
  });

  const toplamRow = ws.addRow([
    '', 'TOPLAM', '',
    toplamBBHB.toFixed(4), toplamBBHB.toFixed(4),
    toplamAlan.toFixed(2), '100.00', ''
  ]);
  satırStilUygula(toplamRow, 'toplam');

  return ws;
}

/**
 * EK 8 - Tahsis Özet Cetveli
 */
function ek8Olustur(wb, hesaplama, proje) {
  const ws = wb.addWorksheet('Ek 8 Tahsis Özet Cetveli');
  ws.pageSetup = { orientation: 'landscape', paperSize: 9 };

  ustBilgiEkle(ws, proje, hesaplama.mahalle, 'EK 8 - KÖY/MAHALLE BAZINDA TAHSİS ÖZET CETVELİ');

  ws.columns = [
    { width: 8 }, { width: 25 }, { width: 15 }, { width: 12 }, { width: 12 },
    { width: 12 }, { width: 12 }, { width: 12 }, { width: 15 }, { width: 20 }
  ];

  const baslikSatiri = ws.addRow([
    'Sıra No', 'Çiftçi Adı Soyadı', 'TC Kimlik No',
    'Büyükbaş', 'Küçükbaş', 'Tek Tırnaklı', 'Deve',
    'Toplam BBHB', 'Tahsis Alanı (Da)', 'Açıklamalar'
  ]);
  baslikSatiri.height = 30;
  satırStilUygula(baslikSatiri, 'baslik');
  ws.getRow(ws.rowCount).font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' }, name: 'Times New Roman' };

  const ek4a = hesaplama.ek4a || {};
  const toplamBBHB = ek4a_toplamBBHB(hesaplama);
  const toplamAlan = hesaplama.ek4b?.toplamAlan || 0;

  let siraNo = 1;
  (ek4a.ciftciler || []).forEach(c => {
    const buyukbas = (c.hayvanlar || []).filter(h => ['sığır', 'manda'].includes(turNorm(h.tur))).reduce((s, h) => s + h.toplamBBHB, 0);
    const kucukbas = (c.hayvanlar || []).filter(h => ['koyun', 'keçi'].includes(turNorm(h.tur))).reduce((s, h) => s + h.toplamBBHB, 0);
    const tektirnakli = (c.hayvanlar || []).filter(h => ['at', 'eşek', 'katır'].includes(turNorm(h.tur))).reduce((s, h) => s + h.toplamBBHB, 0);
    const deve = (c.hayvanlar || []).filter(h => turNorm(h.tur) === 'deve').reduce((s, h) => s + h.toplamBBHB, 0);
    const tahsisAlan = toplamBBHB > 0 ? (c.toplamBBHB / toplamBBHB) * toplamAlan : 0;

    const row = ws.addRow([
      siraNo++, c.adSoyad, c.tcKimlikNo,
      buyukbas.toFixed(4), kucukbas.toFixed(4),
      tektirnakli.toFixed(4), deve.toFixed(4),
      c.toplamBBHB.toFixed(4), tahsisAlan.toFixed(2), ''
    ]);
    satırStilUygula(row, 'veri');
    row.height = 20;
  });

  const toplamRow = ws.addRow([
    '', 'TOPLAM', '', '', '', '', '',
    toplamBBHB.toFixed(4), toplamAlan.toFixed(2), ''
  ]);
  satırStilUygula(toplamRow, 'toplam');

  return ws;
}

/**
 * EK 9 - İtiraz ve Düzeltme Tablosu (Boş Şablon)
 */
function ek9Olustur(wb, hesaplama, proje) {
  const ws = wb.addWorksheet('Ek 9 İtiraz Tablosu');
  ws.pageSetup = { orientation: 'landscape', paperSize: 9 };

  ustBilgiEkle(ws, proje, hesaplama.mahalle, 'EK 9 - İTİRAZ VE DÜZELTME TABLOSU');

  ws.columns = [
    { width: 8 }, { width: 25 }, { width: 15 }, { width: 20 },
    { width: 20 }, { width: 15 }, { width: 25 }
  ];

  const baslikSatiri = ws.addRow([
    'Sıra No', 'İtiraz Eden Kişi', 'TC Kimlik No', 'İtirazın Konusu',
    'İtiraz Tarihi', 'Sonuç', 'Açıklamalar'
  ]);
  baslikSatiri.height = 30;
  satırStilUygula(baslikSatiri, 'baslik');
  ws.getRow(ws.rowCount).font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' }, name: 'Times New Roman' };

  // 20 boş satır
  for (let i = 1; i <= 20; i++) {
    const row = ws.addRow([i, '', '', '', '', '', '']);
    satırStilUygula(row, 'veri');
    row.height = 25;
  }

  return ws;
}

/**
 * EK 10 - Kesinleşen Tahsis Kararları
 */
function ek10Olustur(wb, hesaplama, proje) {
  const ws = wb.addWorksheet('Ek 10 Kesin Tahsis');
  ws.pageSetup = { orientation: 'landscape', paperSize: 9 };

  ustBilgiEkle(ws, proje, hesaplama.mahalle, 'EK 10 - KESİNLEŞEN TAHSİS KARARLARI LİSTESİ');

  ws.columns = [
    { width: 8 }, { width: 25 }, { width: 15 }, { width: 12 }, { width: 12 },
    { width: 15 }, { width: 15 }, { width: 15 }, { width: 20 }
  ];

  const baslikSatiri = ws.addRow([
    'Sıra No', 'Çiftçi Adı Soyadı', 'TC Kimlik No',
    'Tahsis Alanı (Da)', 'BBHB', 'Karar Tarihi',
    'Karar No', 'Tebligat Tarihi', 'Açıklamalar'
  ]);
  baslikSatiri.height = 30;
  satırStilUygula(baslikSatiri, 'baslik');
  ws.getRow(ws.rowCount).font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' }, name: 'Times New Roman' };

  const ek7 = hesaplama.ek7 || {};
  const toplamBBHB = ek4a_toplamBBHB(hesaplama);
  const toplamAlan = hesaplama.ek4b?.toplamAlan || 0;
  const today = new Date().toLocaleDateString('tr-TR');

  (ek7.ciftciler || []).forEach((c, i) => {
    const tahsisAlan = toplamBBHB > 0 ? (c.bbhb / toplamBBHB) * toplamAlan : 0;
    const row = ws.addRow([
      i + 1, c.adSoyad, c.tcKimlikNo,
      tahsisAlan.toFixed(2), Number(c.bbhb || 0).toFixed(4),
      today, '', '', ''
    ]);
    satırStilUygula(row, 'veri');
    row.height = 20;
  });

  return ws;
}

function ek4a_toplamBBHB(hesaplama) {
  return hesaplama.ek4a?.genelToplamBBHB || 0;
}

function turNorm(tur) {
  if (!tur) return '';
  const t = tur.toLowerCase().trim();
  const map = { siğir: 'sığır', sigir: 'sığır', buyukbas: 'sığır', koyun: 'koyun', keci: 'keçi', keçi: 'keçi' };
  return map[t] || t;
}

/**
 * Ana export fonksiyonu - tüm ekleri tek Excel'e yazar
 */
async function tumEkleriExportEt(hesaplama, proje, outputPath) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Mera Kanunu Uygulaması';
  wb.created = new Date();
  wb.modified = new Date();

  // Özet sayfası
  const wsOzet = wb.addWorksheet('ÖZET');
  wsOzet.addRow(['MERA TESPİT TAHDİT TAHSİS ÇALIŞMALARI - HESAPLAMA ÇIKTI DOSYASI']);
  wsOzet.addRow([`İl: ${proje.il} | İlçe: ${proje.ilce} | Köy/Mahalle: ${hesaplama.mahalle}`]);
  wsOzet.addRow([`Hesaplama Tarihi: ${new Date(hesaplama.hesaplamaTarihi).toLocaleDateString('tr-TR')}`]);
  wsOzet.addRow([]);
  wsOzet.addRow(['Ek No', 'İçerik', 'Sayfa Adı']);
  [
    ['Ek 4/A', 'Büyükbaş Hayvan Birimi (BBHB) Hesabı', 'Ek 4-a BBHB Hesabı'],
    ['Ek 4/B', 'Toplam Mera-Çayır Varlığı ve Kapasitesi', 'Ek 4-b Mera Kapasitesi'],
    ['Ek 4/C', 'Hayvan Varlığı ile Mera Kapasitesinin Karşılaştırılması', 'Ek 4-c Karşılaştırma'],
    ['Ek 7', 'Köy/Mahalle Bazında Çiftçi Aileleri Listesi', 'Ek 7 Çiftçi Listesi'],
    ['Ek 7/A', 'Tahsis Yapılacak Köy/Mahallenin Genel Bilgileri', 'Ek 7-a Genel Bilgiler'],
    ['Ek 7/B', 'Mera, Yaylak, Kışlak Parsel Listesi ve Alan Dökümü', 'Ek 7-b Parsel Listesi'],
    ['Ek 7/C', 'Komisyon Tutanağı Bilgileri', 'Ek 7-c Komisyon Tutanağı'],
    ['Ek 7/F', 'Tahsis Kararı Özet Tablosu', 'Ek 7-f Tahsis Kararı'],
    ['Ek 8', 'Köy/Mahalle Bazında Tahsis Özet Cetveli', 'Ek 8 Tahsis Özet Cetveli'],
    ['Ek 9', 'İtiraz ve Düzeltme Tablosu (Boş Şablon)', 'Ek 9 İtiraz Tablosu'],
    ['Ek 10', 'Kesinleşen Tahsis Kararları Listesi', 'Ek 10 Kesin Tahsis']
  ].forEach(r => {
    const row = wsOzet.addRow(r);
    row.getCell(1).font = { bold: true };
  });
  wsOzet.columns = [{ width: 10 }, { width: 55 }, { width: 30 }];
  wsOzet.getRow(1).font = { bold: true, size: 13 };

  // Tüm ekleri oluştur
  ek4aOlustur(wb, hesaplama, proje);
  ek4bOlustur(wb, hesaplama, proje);
  ek4cOlustur(wb, hesaplama, proje);
  ek7Olustur(wb, hesaplama, proje);
  ek7aOlustur(wb, hesaplama, proje);
  ek7bOlustur(wb, hesaplama, proje);
  ek7cOlustur(wb, hesaplama, proje);
  ek7fOlustur(wb, hesaplama, proje);
  ek8Olustur(wb, hesaplama, proje);
  ek9Olustur(wb, hesaplama, proje);
  ek10Olustur(wb, hesaplama, proje);

  await wb.xlsx.writeFile(outputPath);
  return outputPath;
}

module.exports = {
  tumEkleriExportEt,
  ek4aOlustur, ek4bOlustur, ek4cOlustur,
  ek7Olustur, ek7aOlustur, ek7bOlustur, ek7cOlustur, ek7fOlustur,
  ek8Olustur, ek9Olustur, ek10Olustur
};

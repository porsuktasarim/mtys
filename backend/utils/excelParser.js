const XLSX = require('xlsx');

/**
 * Excel dosyasını parse eder, ilk satır header olarak kabul edilir
 */
function parseExcel(filePath) {
  const workbook = XLSX.readFile(filePath, { cellDates: true, dateNF: 'dd.mm.yyyy' });
  const result = {};
  
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { 
      raw: false, 
      defval: '',
      blankrows: false
    });
    result[sheetName] = data;
  });
  
  return result;
}

/**
 * Excel sütun başlıklarını tespit et (tüm sheet'ler için)
 */
function getExcelHeaders(filePath) {
  const workbook = XLSX.readFile(filePath);
  const result = {};
  
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (data.length > 0) {
      result[sheetName] = data[0].map((h, i) => ({ 
        index: i, 
        baslik: String(h).trim(), 
        key: `col_${i}` 
      }));
    }
  });
  
  return result;
}

// ---- HAYVAN LISTESI KOLONLARI ----
const HAYVAN_KOLON_TAHMINI = {
  kupeNo: ['küpe no', 'küpe numarası', 'kupe no', 'kupe numarasi', 'ear tag', 'no', 'hayvan no', 'kupenumara'],
  tur: ['tür', 'tur', 'hayvan türü', 'hayvan tur', 'tür/ırk', 'species', 'cins'],
  irk: ['ırk', 'irk', 'ırk adı', 'breed', 'ırk kodu'],
  cinsiyet: ['cinsiyet', 'sex', 'gender', 'cins', 'dişi/erkek'],
  dogumTarihi: ['doğum tarihi', 'dogum tarihi', 'dt', 'doğum', 'birth date', 'dog.tar'],
  durum: ['durum', 'hayvan durum', 'status', 'hayvanın durumu'],
  anneKupeNo: ['anne küpe no', 'anne kupe', 'anne no', 'mother id', 'anne küpe numarası'],
  il: ['il', 'province', 'şehir', 'il adı'],
  ilce: ['ilçe', 'ilce', 'district', 'ilçe adı'],
  mahalle: ['mahalle', 'köy', 'köy/mahalle', 'mahalle adı', 'village', 'koy'],
  isletme: ['işletme', 'isletme', 'ahır', 'farm', 'işletme no', 'isletme no'],
  suru: ['sürü', 'suru', 'herd', 'sürü no', 'suru kodu'],
  isletmeSahibi: ['işletme sahibi', 'isletme sahibi', 'sahip', 'owner', 'ad soyad', 'çiftçi', 'ciftci', 'firma'],
  tcKimlikNo: ['tc kimlik no', 'tc no', 'tcno', 'kimlik no', 'tc kimlik', 'tckn', 'vergi no']
};

// ---- PARSEL LISTESI KOLONLARI ----
const PARSEL_KOLON_TAHMINI = {
  adaNo: ['ada no', 'ada', 'block no', 'ada numarası'],
  parselNo: ['parsel no', 'parsel', 'parcel no', 'parsel numarası', 'no'],
  yuzolcumu: ['yüzölçümü', 'yuzolcumu', 'alan', 'dekar', 'yüzölçüm', 'alan (dekar)', 'm2', 'ha'],
  araziVasfi: ['arazi vasfı', 'vasıf', 'vasfi', 'kullanım amacı', 'arazi cinsi', 'nitelik', 'tür'],
  mahalle: ['mahalle', 'köy', 'köy/mahalle', 'village', 'koy'],
  il: ['il', 'province'],
  ilce: ['ilçe', 'district'],
  mevkii: ['mevkii', 'mevki', 'konum', 'location'],
  tapuSayfaNo: ['tapu sayfa no', 'sayfa no', 'sayfa'],
  paftaNo: ['pafta no', 'pafta'],
  verimDurumu: ['verim durumu', 'verim', 'durum', 'mera durumu', 'kalite', 'vasıf durumu', 'ek1 durumu']
};

// ---- GÖREVLİ LISTESI KOLONLARI ----
const GOREVLI_KOLON_TAHMINI = {
  adSoyad: ['ad soyad', 'adı soyadı', 'isim', 'name', 'ad', 'adısoyad', 'personel'],
  unvan: ['unvan', 'title', 'görevi', 'pozisyon', 'meslek', 'ünvan'],
  gorev: ['görev', 'komisyon görevi', 'rol', 'role', 'üye tipi'],
  kurum: ['kurum', 'kuruluş', 'birim', 'organization', 'müdürlük']
};

/**
 * Kolon başlıklarından otomatik eşleştirme tahmin et
 */
function kolonEslestirmeTahmin(headers, kolonTahmini) {
  const eslestirme = {};
  
  Object.entries(kolonTahmini).forEach(([alan, alternatifler]) => {
    const bulunan = headers.find(h => {
      const baslikLower = (h.baslik || '').toLowerCase().trim();
      return alternatifler.some(alt => baslikLower.includes(alt) || alt.includes(baslikLower));
    });
    if (bulunan) {
      eslestirme[alan] = bulunan.baslik;
    }
  });
  
  return eslestirme;
}

/**
 * Eşleştirme kullanarak Excel verisini modele dönüştür
 */
function veriDonustur(rows, eslestirme, modelAdi) {
  return rows.map(row => {
    const nesne = {};
    Object.entries(eslestirme).forEach(([alan, kolonBaslik]) => {
      if (kolonBaslik && row[kolonBaslik] !== undefined) {
        let deger = row[kolonBaslik];
        // Sayısal alanlar
        if (['yuzolcumu'].includes(alan)) {
          deger = parseFloat(String(deger).replace(',', '.')) || 0;
        }
        // Tarih alanları
        if (['dogumTarihi'].includes(alan) && deger) {
          const d = new Date(deger);
          nesne[alan] = isNaN(d) ? null : d;
        } else {
          nesne[alan] = String(deger).trim();
        }
      }
    });
    return nesne;
  }).filter(obj => Object.keys(obj).length > 0);
}

module.exports = {
  parseExcel,
  getExcelHeaders,
  HAYVAN_KOLON_TAHMINI,
  PARSEL_KOLON_TAHMINI,
  GOREVLI_KOLON_TAHMINI,
  kolonEslestirmeTahmin,
  veriDonustur
};

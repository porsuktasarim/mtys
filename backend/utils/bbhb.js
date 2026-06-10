/**
 * 4342 Sayılı Mera Kanunu
 * EK-1: Yararlanılabilir Yeşil Ot Verim Tablosu
 * EK-2: İllerin Yıllık Ortalama Yağış Miktarları
 */

// ── EK-2: İl → Yağış Kuşağı (mm aralığı) ─────────────────
const IL_YAGIS = {
  'ADANA':       '650-800',  'ADIYAMAN':    '650-800',  'AFYON':       '350-500',
  'AĞRI':        '500-650',  'AMASYA':      '350-500',  'ANKARA':      '350-500',
  'ANTALYA':     '950-1100', 'ARTVİN':      '650-800',  'AYDIN':       '650-800',
  'BALIKESİR':   '500-650',  'BİLECİK':     '350-500',  'BİNGÖL':      '800-950',
  'BİTLİS':      '1100-1250','BOLU':        '500-650',  'BURDUR':      '350-500',
  'BURSA':       '650-800',  'ÇANAKKALE':   '500-650',  'ÇANKIRI':     '350-500',
  'ÇORUM':       '350-500',  'DENİZLİ':     '500-650',  'DİYARBAKIR':  '350-500',
  'EDİRNE':      '500-650',  'ELAZIĞ':      '350-500',  'ERZİNCAN':    '350-500',
  'ERZURUM':     '350-500',  'ESKİŞEHİR':   '350-500',  'GAZİANTEP':   '500-650',
  'GİRESUN':     '1100-1250','GÜMÜŞHANE':   '350-500',  'HAKKARİ':     '650-800',
  'HATAY':       '1100-1250','ISPARTA':      '500-650',  'MERSİN':      '500-650',
  'İSTANBUL':    '800-950',  'İZMİR':       '650-800',  'KARS':        '500-650',
  'KASTAMONU':   '350-500',  'KAYSERİ':     '350-500',  'KIRKLARELİ': '500-650',
  'KIRŞEHİR':    '350-500',  'KOCAELİ':     '800-950',  'KONYA':       '200-350',
  'KÜTAHYA':     '500-650',  'MALATYA':     '350-500',  'MANİSA':      '650-800',
  'K.MARAŞ':     '650-800',  'KAHRAMANMARAŞ':'650-800', 'MARDİN':      '650-800',
  'MUĞLA':       '1100-1250','MUŞ':         '650-800',  'NEVŞEHİR':    '350-500',
  'NİĞDE':       '200-350',  'ORDU':        '950-1100', 'RİZE':        '1100-1250',
  'SAKARYA':     '800-950',  'SAMSUN':      '650-800',  'SİİRT':       '650-800',
  'SİNOP':       '650-800',  'SİVAS':       '350-500',  'TEKİRDAĞ':    '500-650',
  'TOKAT':       '350-500',  'TRABZON':     '800-950',  'TUNCELİ':     '800-950',
  'ŞANLIURFA':   '350-500',  'UŞAK':        '500-650',  'VAN':         '350-500',
  'YOZGAT':      '500-650',  'ZONGULDAK':   '1100-1250','AKSARAY':     '200-350',
  'BAYBURT':     '350-500',  'KARAMAN':     '200-350',  'KIRIKKALE':   '350-500',
  'BATMAN':      '350-500',  'ŞIRNAK':      '650-800',  'BARTIN':      '950-1100',
  'ARDAHAN':     '500-650',  'IĞDIR':       '200-350',  'YALOVA':      '650-800',
  'KARABÜK':     '350-500',  'KİLİS':       '350-500',  'OSMANİYE':    '800-950',
  'DÜZCE':       '800-950',
};

// ── EK-1 Tablo-1: Yararlanılabilir Yeşil Ot Verimi (kg/da) ─
// Yağış kuşağı → vasıf → kg/da
const YARARLANILABILIR_YESIL_OT = {
  '200-350':  { 'çok iyi': 180, 'iyi': 135, 'orta': 90,  'zayıf': 45  },
  '350-500':  { 'çok iyi': 270, 'iyi': 225, 'orta': 135, 'zayıf': 68  },
  '500-650':  { 'çok iyi': 360, 'iyi': 270, 'orta': 180, 'zayıf': 90  },
  '650-800':  { 'çok iyi': 450, 'iyi': 338, 'orta': 225, 'zayıf': 113 },
  '800-950':  { 'çok iyi': 540, 'iyi': 405, 'orta': 270, 'zayıf': 135 },
  '950-1100': { 'çok iyi': 630, 'iyi': 473, 'orta': 315, 'zayıf': 158 },
  '1100-1250':{ 'çok iyi': 720, 'iyi': 540, 'orta': 360, 'zayıf': 180 },
};

// ── EK-1 Tablo-2: Üretilen Yeşil Ot Verimi (kg/da) ─────────
const URETILEN_YESIL_OT = {
  '200-350':  { 'çok iyi': 360,  'iyi': 270,  'orta': 180, 'zayıf': 90  },
  '350-500':  { 'çok iyi': 540,  'iyi': 450,  'orta': 270, 'zayıf': 136 },
  '500-650':  { 'çok iyi': 720,  'iyi': 540,  'orta': 360, 'zayıf': 180 },
  '650-800':  { 'çok iyi': 900,  'iyi': 676,  'orta': 450, 'zayıf': 226 },
  '800-950':  { 'çok iyi': 1080, 'iyi': 810,  'orta': 540, 'zayıf': 270 },
  '950-1100': { 'çok iyi': 1260, 'iyi': 946,  'orta': 630, 'zayıf': 316 },
  '1100-1250':{ 'çok iyi': 1440, 'iyi': 1080, 'orta': 720, 'zayıf': 360 },
};

// ── EK-1 Tablo-3: Üretilen Kuru Ot Verimi (kg/da) ──────────
const URETILEN_KURU_OT = {
  '200-350':  { 'çok iyi': 90,  'iyi': 67.5,  'orta': 45,    'zayıf': 22.5 },
  '350-500':  { 'çok iyi': 135, 'iyi': 112.5, 'orta': 67.5,  'zayıf': 34   },
  '500-650':  { 'çok iyi': 180, 'iyi': 135,   'orta': 90,    'zayıf': 45   },
  '650-800':  { 'çok iyi': 225, 'iyi': 169,   'orta': 112.5, 'zayıf': 56.5 },
  '800-950':  { 'çok iyi': 270, 'iyi': 202.5, 'orta': 135,   'zayıf': 67.5 },
  '950-1100': { 'çok iyi': 315, 'iyi': 236.5, 'orta': 157.5, 'zayıf': 79   },
  '1100-1250':{ 'çok iyi': 360, 'iyi': 270,   'orta': 180,   'zayıf': 90   },
};

// Yararlanılabilir kuru ot = üretilen kuru ot × 0.5 (yönetmelik)
const YARARLANMA_ORANI = 0.5;

/**
 * İl adına göre yağış kuşağını döndür
 */
function ildenYagisKusagi(il) {
  if (!il) return null;
  const ilUpper = il.toUpperCase().trim();
  return IL_YAGIS[ilUpper] || null;
}

/**
 * EK-1 tablosundan ot verimi hesapla
 * @returns { yararlanilabilirYesilOt, uretYesilOt, uretKuruOt, yararlanilabilirKuruOt }
 */
function otVerimiHesapla(yagisKusagi, vasif) {
  const k = yagisKusagi || '350-500';
  const v = (vasif || 'orta').toLowerCase().trim();

  const yYesil  = (YARARLANILABILIR_YESIL_OT[k] || YARARLANILABILIR_YESIL_OT['350-500'])[v]
                  ?? (YARARLANILABILIR_YESIL_OT[k] || YARARLANILABILIR_YESIL_OT['350-500'])['orta'];
  const uYesil  = (URETILEN_YESIL_OT[k] || URETILEN_YESIL_OT['350-500'])[v]
                  ?? (URETILEN_YESIL_OT[k] || URETILEN_YESIL_OT['350-500'])['orta'];
  const uKuru   = (URETILEN_KURU_OT[k] || URETILEN_KURU_OT['350-500'])[v]
                  ?? (URETILEN_KURU_OT[k] || URETILEN_KURU_OT['350-500'])['orta'];
  const yKuru   = Math.round(uKuru * YARARLANMA_ORANI * 10) / 10;

  return {
    yararlanilabilirYesilOt: yYesil,
    uretYesilOt:  uYesil,
    uretKuruOt:   uKuru,
    yararlanilabilirKuruOt: yKuru,
  };
}

/**
 * Mera kapasitesi hesabı — Yönetmelik Madde 4
 * 1 BBHB = 500 kg → günlük kuru ot ihtiyacı = %2,5 × 500 = 12,5 kg/gün
 *
 * Kapasite (BBHB) = Yararlanılabilir kuru ot (kg) / (12,5 kg/gün × otlatmaSuresi gün)
 */
function meraKapasiteHesapla(toplamAlan, yararlanilabilirKuruOt, otlatmaSuresi) {
  const alan         = parseFloat(toplamAlan)           || 0;
  const verim        = parseFloat(yararlanilabilirKuruOt)|| 0;
  const sure         = parseFloat(otlatmaSuresi)        || 180;
  const gunlukIhtiyac = 12.5; // kg/BBHB/gün (500 kg × %2,5)
  if (verim === 0 || sure === 0) return 0;
  return (alan * verim) / (gunlukIhtiyac * sure);
}

// ── BBHB Katsayıları (Resmi 16 Kategori) ──────────────────
const BBHB_KATEGORILER = [
  { id: 1,  label: 'Kültür ırkı süt ineği',     katsayi: 1.00 },
  { id: 2,  label: 'Kültür melezi inek',         katsayi: 0.75 },
  { id: 3,  label: 'Yerli inek',                 katsayi: 0.50 },
  { id: 4,  label: 'Dana-düve (kültür ırkı)',    katsayi: 0.60 },
  { id: 5,  label: 'Dana-düve (kültür melezi)',  katsayi: 0.45 },
  { id: 6,  label: 'Dana-düve (yerli)',          katsayi: 0.30 },
  { id: 7,  label: 'Koyun',                      katsayi: 0.10 },
  { id: 8,  label: 'Keçi',                       katsayi: 0.08 },
  { id: 9,  label: 'Manda (erkek)',              katsayi: 0.90 },
  { id: 10, label: 'Manda (dişi)',               katsayi: 0.75 },
  { id: 11, label: 'Öküz',                       katsayi: 0.60 },
  { id: 12, label: 'Kuzu-Oğlak',                katsayi: 0.04 },
  { id: 13, label: 'Boğa',                       katsayi: 1.50 },
  { id: 14, label: 'At',                         katsayi: 0.50 },
  { id: 15, label: 'Katır',                      katsayi: 0.40 },
  { id: 16, label: 'Eşek',                       katsayi: 0.30 },
];

const TUR_NORMALIZ = {
  'sığır':'sığır','sigir':'sığır','siğir':'sığır',
  'inek':'sığır','dana':'sığır','düve':'sığır','duve':'sığır',
  'boğa':'sığır','boga':'sığır','öküz':'sığır','okuz':'sığır',
  'buzağı':'sığır','buzagi':'sığır',
  'manda':'manda',
  'koyun':'koyun','koç':'koyun','koc':'koyun','kuzu':'kuzu',
  'keçi':'keçi','keci':'keçi','teke':'keçi',
  'oğlak':'oğlak','oglak':'oğlak',
  'kuzu-oğlak':'kucuk','kuzu oğlak':'kucuk','kuzuoglak':'kucuk',
  'at':'at','beygir':'at','aygır':'at','aygir':'at','kısrak':'at','kisrak':'at','tay':'at',
  'eşek':'eşek','esek':'eşek','merkep':'eşek',
  'katır':'katır','katir':'katır',
  'deve':'deve',
};

// ── Irk Tespiti — Yönetmelik Madde 6 ──────────────────────
// Kural: ırk adı "M" ile bitiyorsa → melez
//        ırk adı "yerli" içeriyorsa → yerli
//        diğerleri → kültür
function normalizeIrk(irk) {
  if (!irk) return 'kultur'; // bilinmiyorsa kültür say
  const s = irk.trim();
  const sUpper = s.toUpperCase();
  const sLower = s.toLowerCase();

  // "M" ile bitenler → melez (örn: "SİMENTAL M", "HOLSTEİN M")
  if (sUpper.endsWith(' M') || sUpper.endsWith('-M')) return 'melez';

  // "yerli" geçenler → yerli
  if (sLower.includes('yerli') || sLower.includes('boz') ||
      sLower.includes('doğu anadolu') || sLower.includes('yerlikara')) return 'yerli';

  // Bilinen melez ifadeler
  if (sLower.includes('melez') || sLower.includes('kültür melezi') ||
      sLower.includes('kultur melezi') || sLower.includes('crossbred')) return 'melez';

  // Diğer her şey → kültür ırkı
  return 'kultur';
}

function normalizeTur(tur) {
  if (!tur) return 'sığır';
  return TUR_NORMALIZ[tur.toLowerCase().trim()] || tur.toLowerCase().trim();
}

function normalizeCinsiyet(cinsiyet) {
  if (!cinsiyet) return null;
  const c = cinsiyet.toLowerCase().trim();
  if (c.includes('erkek') || c === 'e') return 'erkek';
  if (c.includes('dişi') || c.includes('disi') || c === 'd') return 'disi';
  if (c.includes('öküz') || c.includes('okuz')) return 'okuz';
  return null;
}

function yasHesapla(dogumTarihi) {
  if (!dogumTarihi) return null;
  const dogum = new Date(dogumTarihi);
  if (isNaN(dogum)) return null;
  return (Date.now() - dogum) / (1000 * 60 * 60 * 24 * 30.44); // ay cinsinden döndür
}

/**
 * Hayvanın EK 7/C kategorisini belirle
 * Yönetmelik Madde 6 kuralları:
 * - Sığır: 15 aydan küçük → dana-düve
 * - Küçükbaş: 9 aydan küçük → kuzu-oğlak
 * - Irk tespiti: "M" ile biten → melez, "yerli" içeren → yerli, diğer → kültür
 */
function hayvanKategoriTespit(tur, cinsiyet, dogumTarihi, irk) {
  const turNorm  = normalizeTur(tur);
  const cinsNorm = normalizeCinsiyet(cinsiyet);
  const irkNorm  = normalizeIrk(irk);
  const yasAy    = yasHesapla(dogumTarihi); // ay cinsinden

  // ── Küçükbaş ──────────────────────────────────────────
  if (turNorm === 'koyun') {
    if (yasAy !== null && yasAy < 9) return { kategori: 'kuzuOglak', katsayi: 0.04 };
    return { kategori: 'koyun', katsayi: 0.10 };
  }
  if (turNorm === 'keçi') {
    if (yasAy !== null && yasAy < 9) return { kategori: 'kuzuOglak', katsayi: 0.04 };
    return { kategori: 'keci', katsayi: 0.08 };
  }
  // Direkt kuzu/oğlak olarak girilmişse
  const turOrig = (tur || '').toLowerCase();
  if (turOrig.includes('kuzu') || turOrig.includes('oğlak') || turOrig.includes('oglak')) {
    return { kategori: 'kuzuOglak', katsayi: 0.04 };
  }

  // ── Manda ─────────────────────────────────────────────
  if (turNorm === 'manda') {
    return cinsNorm === 'erkek'
      ? { kategori: 'mandaErkek', katsayi: 0.90 }
      : { kategori: 'mandaDisi',  katsayi: 0.75 };
  }

  // ── Diğer türler ──────────────────────────────────────
  if (turNorm === 'at')    return { kategori: 'at',    katsayi: 0.50 };
  if (turNorm === 'katır') return { kategori: 'katir', katsayi: 0.40 };
  if (turNorm === 'eşek')  return { kategori: 'esek',  katsayi: 0.30 };

  // ── Sığır ─────────────────────────────────────────────
  if (turNorm === 'sığır') {
    // Öküz
    if (cinsNorm === 'okuz') return { kategori: 'okuz', katsayi: 0.60 };

    // Boğa: erkek + 15 ay ve üzeri
    if (cinsNorm === 'erkek' && (yasAy === null || yasAy >= 15)) {
      return { kategori: 'boga', katsayi: 1.50 };
    }

    // Dana-düve: 15 aydan küçük
    if (yasAy !== null && yasAy < 15) {
      if (irkNorm === 'kultur') return { kategori: 'kulturDanaDuve', katsayi: 0.60 };
      if (irkNorm === 'melez')  return { kategori: 'melezDanaDuve',  katsayi: 0.45 };
      return { kategori: 'yerliDanaDuve', katsayi: 0.30 };
    }

    // İnek (15 ay ve üzeri dişi veya yaş bilinmiyor)
    if (irkNorm === 'kultur') return { kategori: 'kulturInek', katsayi: 1.00 };
    if (irkNorm === 'melez')  return { kategori: 'melezInek',  katsayi: 0.75 };
    return { kategori: 'yerliInek', katsayi: 0.50 };
  }

  // Bilinmeyen tür → yerli inek varsayılan
  return { kategori: 'yerliInek', katsayi: 0.50 };
}

function bbhbKatsayiHesapla(tur, cinsiyet, dogumTarihi, irk) {
  return hayvanKategoriTespit(tur, cinsiyet, dogumTarihi, irk).katsayi;
}

module.exports = {
  IL_YAGIS,
  YARARLANILABILIR_YESIL_OT,
  URETILEN_YESIL_OT,
  URETILEN_KURU_OT,
  BBHB_KATEGORILER,
  TUR_NORMALIZ,
  ildenYagisKusagi,
  otVerimiHesapla,
  meraKapasiteHesapla,
  bbhbKatsayiHesapla,
  hayvanKategoriTespit,
  normalizeTur,
  normalizeIrk,
  normalizeCinsiyet,
  yasHesapla,
};

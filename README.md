# 🌿 Mera Tahsis Yönetim Sistemi

**4342 Sayılı Mera Kanunu** kapsamında Mera, Yaylak ve Kışlakların Tespit, Tahdit ve Tahsis Çalışmaları için otomatik hesaplama ve yasal ek form üretim sistemi.

---

## 📋 İçindekiler

- [Özellikler](#özellikler)
- [Teknolojiler](#teknolojiler)
- [Hızlı Kurulum (Docker)](#hızlı-kurulum-docker)
- [Manuel Kurulum](#manuel-kurulum)
- [Kullanım Kılavuzu](#kullanım-kılavuzu)
- [Girdi Dosyası Formatları](#girdi-dosyası-formatları)
- [Üretilen Formlar](#üretilen-formlar)
- [BBHB Katsayı Tablosu](#bbhb-katsayı-tablosu)
- [API Referansı](#api-referansı)
- [Proje Yapısı](#proje-yapısı)

---

## ✨ Özellikler

- 📊 **Çoklu Excel Yükleme** — Hayvan, parsel ve görevli listelerini ayrı veya birden fazla dosyayla yükleyin
- 🔀 **Akıllı Sütun Eşleştirme** — Farklı formatlardaki Excel başlıklarını otomatik tanıma ve eşleştirme
- 🏘️ **Çok Mahalleli Destek** — Birden fazla köy/mahalleye ortak tahsis desteği
- 🧮 **Otomatik BBHB Hesabı** — Mera Yönetmeliği Madde 6'ya göre tüm hayvan türleri için
- 📁 **Yasal Form Üretimi** — Ek 4/a, 4/b, 4/c, 7, 7/a, 7/b, 7/c, 7/f, 8, 9, 10 eklerinin Excel formatında çıktısı
- ⚠️ **Hata Denetimi** — Eksik/hatalı veri uyarıları
- 🐳 **Docker Desteği** — Tek komutla kurulum

---

## 🛠 Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Backend | Node.js 20 + Express.js |
| Veritabanı | MongoDB 7 (Mongoose ODM) |
| Şablon Motor | EJS + layout middleware |
| Frontend | Bootstrap 5.3 |
| Excel İşleme | ExcelJS (yazma) + xlsx (okuma) |
| Dosya Yükleme | Multer |
| Konteyner | Docker + Docker Compose |

---

## 🐳 Hızlı Kurulum (Docker)

### Gereksinimler

- [Docker](https://docs.docker.com/get-docker/) 24+
- [Docker Compose](https://docs.docker.com/compose/install/) 2.x

### 1. Depoyu Klonla

```bash
git clone https://github.com/KULLANICI_ADI/mera-yonetim-sistemi.git
cd mera-yonetim-sistemi
```

### 2. Ortam Değişkenlerini Ayarla

```bash
cp .env.example .env
# .env dosyasını düzenleyin (isteğe bağlı, varsayılanlar çalışır)
```

### 3. Başlat

```bash
docker compose up -d
```

### 4. Tarayıcıda Aç

```
http://localhost:3000
```

MongoDB Yönetim Arayüzü (mongo-express):
```
http://localhost:8081
Kullanıcı: admin | Şifre: pass (docker-compose.yml'de değiştirilebilir)
```

### Durdur

```bash
docker compose down
```

### Sıfırla (verileri sil)

```bash
docker compose down -v
```

---

## 💻 Manuel Kurulum

### Gereksinimler

- Node.js 18+
- MongoDB 6+

### Adımlar

```bash
# Bağımlılıkları kur
npm install

# Ortam değişkenlerini ayarla
cp .env.example .env
# .env dosyasında MONGODB_URI ve SESSION_SECRET değerlerini düzenleyin

# Geliştirme modunda başlat
npm run dev

# Üretim modunda başlat
npm start
```

---

## 📖 Kullanım Kılavuzu

### 1. Proje Oluştur

`Yeni Proje` butonuna tıklayın ve aşağıdaki bilgileri girin:

- **İl / İlçe** — Çalışmanın yapıldığı yer
- **Yıl** — Çalışma yılı
- **Kapasite Sabiti** — 1 BBHB = kaç dekar (varsayılan: 2.0 dekar)
- **Ot Verimi** — Dekar başına kg kuru ot (varsayılan: 50 kg/dekar)
- **Açıklama** — İsteğe bağlı not

### 2. Veri Yükle

Proje detay sayfasından `Veri Yükle` butonuna tıklayın:

**Adım 1 — Dosya Seç:**
- Hayvan listesi Excel dosyasını seçin
- Parsel listesi Excel dosyasını seçin
- Görevli listesi Excel dosyasını seçin (isteğe bağlı)
- `İleri` butonuna tıklayın

**Adım 2 — Sütunları Eşleştir:**
- Sistem Excel başlıklarını otomatik eşleştirmeye çalışır
- Eşleşmeyen alanları açılır listeden seçin
- Zorunlu alanlar (*) ile işaretlidir
- `Kaydet ve Devam Et` butonuna tıklayın

**Adım 3 — Onay:**
- Yüklenen kayıt sayılarını kontrol edin
- `Hesaplamaya Geç` butonuna tıklayın

### 3. Hesapla ve Dışa Aktar

Proje detay sayfasında:
- Mahalle seçin (veya tümü için boş bırakın)
- `Hesapla` butonuna tıklayın
- İşlem tamamlandıktan sonra `Excel İndir` butonuyla tüm ekleri indirin

---

## 📂 Girdi Dosyası Formatları

### Hayvan Listesi

| Sütun | Açıklama | Zorunlu |
|-------|----------|---------|
| Küpe No | Hayvanın resmi küpe numarası | ✅ |
| Tür | sığır / manda / koyun / keçi / at / eşek / deve | ✅ |
| Irk | Hayvanın ırkı | |
| Cinsiyet | erkek / dişi / dişi_damızlık vb. | ✅ |
| Doğum Tarihi | GG.AA.YYYY formatında | ✅ |
| Durum | canlı / ölü vb. | |
| Anne Küpe No | Annenin küpe numarası | |
| İl | İl adı | |
| İlçe | İlçe adı | |
| Mahalle | Köy/mahalle adı | ✅ |
| İşletme | İşletme adı/kodu | |
| Sürü | Sürü adı/kodu | |
| İşletme Sahibi | Ad soyad veya firma adı | ✅ |
| TC Kimlik No | 11 haneli TC kimlik no | ✅ |

> **Not:** Sütun başlıkları tam eşleşmek zorunda değildir. Yükleme sırasında eşleştirme yapılır.

### Parsel Listesi

| Sütun | Açıklama | Zorunlu |
|-------|----------|---------|
| Ada No | Kadastro ada numarası | |
| Parsel No | Kadastro parsel numarası | ✅ |
| Yüzölçümü | Dekar cinsinden alan | ✅ |
| Arazi Vasfı | mera / çayır / yaylak / kışlak | ✅ |
| Mahalle | Köy/mahalle adı | ✅ |
| İl | İl adı | |
| İlçe | İlçe adı | |
| Mevkii | Arazinin mevkii | |

### Görevli Listesi

| Sütun | Açıklama | Zorunlu |
|-------|----------|---------|
| Ad Soyad | Görevlinin tam adı | ✅ |
| Unvan | Görev unvanı (Ziraat Mühendisi vb.) | ✅ |
| Görev | Komisyon görevi (Başkan, Üye vb.) | |
| Kurum | Bağlı olduğu kurum | |

---

## 📋 Üretilen Formlar

| Form | İçerik |
|------|--------|
| **Ek 4/a** | Köy/mahalle büyükbaş hayvan birimi (BBHB) hesabı — çiftçi bazında |
| **Ek 4/b** | Toplam mera-çayır varlığı ve kapasitesi — parsel bazında |
| **Ek 4/c** | Mevcut hayvan varlığı ile mera kapasitesinin karşılaştırması |
| **Ek 7** | Köy/mahalle bazında çiftçi aileleri listesi |
| **Ek 7/a** | Tahsis yapılacak köy/mahallenin genel bilgileri |
| **Ek 7/b** | Mera, yaylak, kışlak parsel listesi ve alan dökümü |
| **Ek 7/c** | Komisyon tutanağı (görevli listesinden otomatik) |
| **Ek 7/f** | Tahsis kararı özet tablosu |
| **Ek 8** | Köy/mahalle bazında tahsis özet cetveli |
| **Ek 9** | İtiraz ve düzeltme tablosu (boş şablon) |
| **Ek 10** | Kesinleşen tahsis kararları listesi |

---

## 🐄 BBHB Katsayı Tablosu

*Mera Yönetmeliği Madde 6 kapsamında:*

| Tür | Kategori | Katsayı |
|-----|----------|---------|
| Sığır | Erkek damızlık (≥2 yaş) | 1.40 |
| Sığır | İnek (≥2 yaş) | 1.00 |
| Sığır | Düve/Tosun (1-2 yaş) | 0.70 |
| Sığır | Buzağı (0-1 yaş) | 0.30 |
| Manda | Erkek (≥3 yaş) | 1.40 |
| Manda | Dişi (≥3 yaş) | 1.20 |
| Manda | Tokluk (1-3 yaş) | 0.80 |
| Manda | Yavru (0-1 yaş) | 0.40 |
| Koyun | Koç (≥1 yaş) | 0.15 |
| Koyun | Koyun (≥1 yaş) | 0.12 |
| Koyun | Toklu/Tokluk | 0.10 |
| Koyun | Kuzu (0-1 yaş) | 0.05 |
| Keçi | Teke (≥1 yaş) | 0.14 |
| Keçi | Keçi (≥1 yaş) | 0.12 |
| Keçi | Oğlak (0-1 yaş) | 0.05 |
| At | Aygır (≥3 yaş) | 1.30 |
| At | Kısrak (≥3 yaş) | 1.00 |
| At | Tay (0-3 yaş) | 0.50 |
| Eşek | Erkek (≥3 yaş) | 0.60 |
| Eşek | Dişi (≥3 yaş) | 0.50 |
| Deve | Erkek (≥4 yaş) | 2.50 |
| Deve | Dişi (≥4 yaş) | 2.00 |

---

## 🔌 API Referansı

### Projeler

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| GET | `/api/projeler` | Proje listesi |
| GET | `/api/projeler/:id` | Proje detayı |
| POST | `/api/projeler` | Yeni proje |
| PUT | `/api/projeler/:id` | Proje güncelle |
| DELETE | `/api/projeler/:id` | Proje sil |

### Veriler

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| GET | `/api/:projeId/mahalleler` | Mahalle listesi |
| GET | `/api/:projeId/hayvanlar` | Hayvan listesi |
| GET | `/api/:projeId/parseller` | Parsel listesi |
| GET | `/api/:projeId/gorevliler` | Görevli listesi |
| GET | `/api/:projeId/hesaplamalar` | Hesaplama sonuçları |
| GET | `/api/:projeId/istatistikler` | Özet istatistikler |
| GET | `/api/bbhb-tablosu` | BBHB katsayı tablosu |

### Hesaplama & Export

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| POST | `/hesapla/:projeId` | Hesaplama başlat |
| GET | `/export/:projeId` | Tüm ekler (Excel) |
| GET | `/export/:projeId/:mahalle` | Mahalle ekler (Excel) |

---

## 📁 Proje Yapısı

```
mera-app/
├── backend/
│   ├── middleware/
│   │   ├── layout.js          # EJS layout wrapper
│   │   └── upload.js          # Multer konfigürasyonu
│   ├── models/
│   │   ├── Proje.js           # Proje şeması
│   │   ├── Hayvan.js          # Hayvan şeması
│   │   ├── Parsel.js          # Parsel şeması
│   │   ├── Gorevli.js         # Görevli şeması
│   │   └── Hesaplama.js       # Hesaplama sonuçları
│   ├── routes/
│   │   ├── index.js           # Ana sayfa
│   │   ├── projeler.js        # Proje CRUD
│   │   ├── yukle.js           # Dosya yükleme
│   │   ├── hesapla.js         # Hesaplama motoru
│   │   ├── export.js          # Excel çıktısı
│   │   └── api.js             # REST API
│   ├── utils/
│   │   ├── bbhb.js            # BBHB katsayı hesaplama
│   │   ├── excelParser.js     # Excel okuma/eşleştirme
│   │   └── excelExport.js     # Excel oluşturma (tüm ekler)
│   └── server.js              # Express ana sunucu
├── frontend/
│   ├── public/
│   │   ├── css/main.css       # Özel stiller
│   │   ├── js/main.js         # İstemci JS
│   │   └── assets/favicon.svg
│   └── views/
│       ├── layout.ejs         # Ana şablon
│       ├── index.ejs          # Ana sayfa
│       ├── error.ejs          # Hata sayfası
│       ├── projeler/          # Proje görünümleri
│       ├── yukle/             # Yükleme sihirbazı
│       └── hesapla/           # Hesaplama sonuçları
├── uploads/                   # Yüklenen dosyalar (gitignore'da)
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── .gitignore
└── package.json
```

---

## 🚀 GitHub'a Yükleme

```bash
# Git başlat
git init
git add .
git commit -m "feat: Mera Tahsis Yönetim Sistemi v1.0"

# GitHub'da yeni repo oluşturun, ardından:
git remote add origin https://github.com/KULLANICI_ADI/mera-yonetim-sistemi.git
git branch -M main
git push -u origin main
```

---

## 🔧 Sorun Giderme

### MongoDB bağlantı hatası

```bash
# MongoDB container'ının çalıştığını kontrol edin
docker compose ps

# Logları kontrol edin
docker compose logs mongo
```

### Port çakışması

`.env` dosyasında `PORT` değerini değiştirin:
```
PORT=3001
```

### Yükleme hatası (dosya boyutu)

`backend/middleware/upload.js` içinde `limits.fileSize` değerini artırın.

---

## 📄 Lisans

MIT © 2025 — 4342 Sayılı Mera Kanunu Uygulamaları için Geliştirilmiştir.

---

## ⚖️ Yasal Not

Bu yazılım **4342 Sayılı Mera Kanunu** ve **Mera Yönetmeliği** kapsamındaki teknik çalışmaları desteklemek amacıyla geliştirilmiştir. Üretilen formlar resmi talimat formatına uygun olmakla birlikte, yetkili komisyon onayı olmadan hukuki geçerlilik taşımaz.

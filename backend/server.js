require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const morgan = require('morgan');
const methodOverride = require('method-override');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/merakanunu';

// Upload dizinleri oluştur
const uploadDirs = ['uploads/temp', 'uploads/hayvan', 'uploads/parsel', 'uploads/gorevli', 'uploads/output'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Middleware
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'mera-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGODB_URI, ttl: 24 * 60 * 60 }),
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Flash messages middleware
app.use((req, res, next) => {
  res.locals.flash = req.session.flash || {};
  delete req.session.flash;
  next();
});

// Layout middleware
app.use(require('./middleware/layout'));

// Routes
app.use('/', require('./routes/index'));
app.use('/projeler', require('./routes/projeler'));
app.use('/yukle', require('./routes/yukle'));
app.use('/hesapla', require('./routes/hesapla'));
app.use('/export', require('./routes/export'));
app.use('/api', require('./routes/api'));

// 404
app.use((req, res) => {
  res.status(404).render('error', { title: 'Sayfa Bulunamadı', message: 'Aradığınız sayfa bulunamadı.', code: 404 });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: 'Sunucu Hatası', message: err.message || 'Beklenmeyen bir hata oluştu.', code: 500 });
});

// MongoDB bağlantısı
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB bağlantısı kuruldu:', MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`🌱 Mera Kanunu Uygulaması çalışıyor: http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB bağlantı hatası:', err.message);
    process.exit(1);
  });

module.exports = app;

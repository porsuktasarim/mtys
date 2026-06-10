db = db.getSiblingDB('merakanunu');
db.createCollection('projeler');
db.createCollection('hayvanlar');
db.createCollection('parseller');
db.createCollection('gorevliler');
db.createCollection('hesaplamalar');
print('MongoDB merakanunu veritabanı başlatıldı.');

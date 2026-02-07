# Maestro Proje Kuralları & Komutlar

## 📦 Yedekleme (Backup)
Kullanıcı "YEDEKLE" veya "BEY YEDEKLE" dediğinde aşağıdaki işlem yapılmalıdır:
- `node scripts/backup_project.js` komutunu çalıştır.
- Bu işlem tüm kritik dosyaları `YEDEK/maestro_backup_YYYYMMDD_HHMMSS` klasörüne paketler.

## 🛠️ Sayfa Stilleri (Page Style)
- Thumbnail'lar üzerinde sağ tık ile açılan menü bağımsız bir sistemdir.
- Detaylar için `docs/PAGE_STYLE_MENU.md` dosyasını incele.

## 📁 Klasör Yapısı
- `css/`: Stil dosyaları (`style.css`, `pagebar.css`)
- `js/`: JavaScript mantığı (`app.js`, `*_menu.js`)
- `api/`: Sunucu tarafı PHP scriptleri
- `docs/`: Proje dökümantasyonu (.md dosyaları)
- `saves/`: Proje kayıt dosyaları (JSON + PNG)
- `Links/`: Yüklenen resimlerin (WebP) saklandığı yer

## 🚀 Versiyonlama
- Her önemli görsel veya fonksiyonel değişiklikte `js/app.js` içindeki `currentVersion` ve `index.html` içindeki asset linkleri (v=XX) güncellenmelidir.

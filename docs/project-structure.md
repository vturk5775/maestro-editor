# Proje Yapısı (Son Güncelleme: 07 Şubat 2026 - MODÜLER GEÇİŞ)

Proje artık tamamen modüler bir JS yapısına sahiptir. Tüm detaylı mimari harita için kök dizindeki **[README_AI.md](../README_AI.md)** dosyasına bakınız.

### Özet Harita
| Bölüm | Görev | Dosya |
|-------|-------|-------|
| **Core** | State & Render | `js/core.js` |
| **Logic** | Ana Olaylar | `js/app.js` |
| **PageBar** | Yan Menü | `js/pagebar.js` |
| **Media** | Resim/Renk | `js/image-upload.js` |
| **History** | Geri Al | `js/history.js` |
| **Storage** | Kayıt/Kurtarma | `js/persistence.js` + `js/recovery_manager.js` |

Geliştirme yaparken tek devasa dosya (`app.js`) yerine ilgili uzman dosyayı bulunuz.

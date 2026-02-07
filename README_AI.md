# 🤖 MAESTRO - AI KILAVUZU (ARCHITECTURAL MAP)

Bu dosya, Maestro projesini okuyan/analiz eden herhangi bir AI agent (Grok, Claude, Antigravity) için yol haritasıdır. Proje, 07 Şubat 2026 tarihinde modüler yapıya geçirilmiştir.

## 🏗️ Dosya Yapısı & Mantığı

### 1. Frontend (JS Modülleri)
Tüm JS mantığı `js/` klasöründe uzmanlaşmış modüllere ayrılmıştır:

*   **`js/core.js`**: **KALP**. 
    *   Shared `state` objesi burada bulunur (pages, currentPageId, zoomLevel).
    *   `loadPage()`: Sayfaları canvas'a çizer ve overlay'leri yönetir.
    *   `renderToCanvas()`: Çizim motoru.
*   **`js/app.js`**: **ORKESTRA ŞEFİ**. 
    *   `index.html` tarafından `type="module"` olarak yüklenen tek dosyadır.
    *   Keyboard listener'lar, Save/Load modalları ve genel UI event'leri buradadır.
*   **`js/pagebar.js`**: **SIDEBAR & THUMBNAILS**.
    *   Thumbnail oluşturma, `refreshThumb()` ve `updateThumbnails()`.
    *   Sayfa Ekle/Sil/Ekle (`addPage`, `deletePage`, `insertPage`).
    *   Sürükle-Bırak (Drag & Drop) mantığı.
*   **`js/image-upload.js`**: **MEDYA & RENK**.
    *   `handleImageUpload()`: Resmi WebP'ye çevirip sunucuya atar.
    *   `openColorPicker()`: Gelişmiş renk seçim arayüzü.
    *   `injectPageOverlay()`: Boş sayfalardaki butonları basar.
*   **`js/history.js`**: **ZAMAN MAKİNESİ**.
    *   `saveHistory()`: Snapshot alır.
    *   Undo/Redo mantığı ve kısayolları (Ctrl+Z).
*   **`js/zoom-pan.js`**: **NAVİGASYON**.
    *   Canvas zoom (scale) ve pan (kaydırma) fonksiyonları.
*   **`js/persistence.js`**: **HAFIZA**.
    *   `autoSave()`: LocalStorage yedeği alır.
*   **`js/preview_manager.js`**: **ÖNİZLEME**.
    *   Preview modunda nelerin gizleneceğini (`hiddenElements`) yönetir.
*   **`js/recovery_manager.js`**: **AKILLI KURTARMA**.
    *   InDesign stili, sayfa kapansa bile son halini geri getiren kart yapısı.

### 2. Görünüm (CSS)
*   **`css/style.css`**: Ana UI, modallar, renkler ve Preview mod animasyonları.
*   **`css/pagebar.css`**: Thumbnail bar tasarımı ve buton efektleri.

### 3. Backend (API)
*   **`api/api_save.php`**: Projeyi `.json` olarak `saves/` klasörüne yazar.
*   **`api/api_upload.php`**: `assets/` klasörüne resim yükler.
*   **`api/api_list.php`**: Kayıtlı projeleri listeler.

## 🛠️ AI İÇİN GELİŞTİRME NOTLARI
1.  **State Değişikliği:** Bir değişkeni (örn: `pages`) değiştirdiğinde `js/core.js` içindeki `state.pages` objesini güncellediğine emin ol.
2.  **Yenileme:** UI'da bir şey değişince mutlaka `loadPage(state.currentPageId)` çağırılmalıdır.
3.  **Tarihçe:** Her kullanıcı işleminden (silme, renk değişimi, resim yükleme) hemen ÖNCE `saveHistory()` çağrılmalıdır.
4.  **Hafıza:** İşlemden sonra `autoSave()` çağrılarak sessiz yedek güncellenmelidir.

*Versiyon: CACHE 34*

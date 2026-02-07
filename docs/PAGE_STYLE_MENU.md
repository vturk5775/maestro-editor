# Maestro Page Style Menu System

Tarih: 7 Şubat 2026 - Versiyon: CACHE 10

Bu döküman, Maestro Editör projesindeki izole edilmiş "Page Style" (Sağ Tık Menüsü) sistemini açıklamaktadır.

## 📁 Dosya Yapısı
- **index.html**: Menü elementini barındırır ve `page_style_menu.js` dosyasını dahil eder.
- **style.css**: `.context-menu` ve `.menu-item` CSS sınıfları ile premium tasarımı sağlar.
- **page_style_menu.js**: Sağ tık algılama, menü konumlandırma ve aksiyon iletimi mantığını barındırır.
- **app.js**: Menüden gelen emirleri (`handlePageStyleAction`) icra eder.

## 🚀 Fonksiyonel Özellikler
1. **Total Page Display**: Pagebar üst kısmında, "Insert Page" butonu altında toplam sayfa sayısını dinamik olarak gösterir.
2. **Page Style (Sağ Tık)**: Thumbnail'lar üzerinde sağ tık yapıldığında özel bir menü açar.
3. **İzole Tasarım**: Bu sistem diğer menü yapılarından tamamen ayrıdır, kendine has CSS ve JS dosyalarıyla yönetilir.

## 🛠️ Menü Aksiyonları (Layout Styles)
- **Empty Page**: Sayfayı tamamen boşaltır.
- **2 Column Page**: Sayfayı 2 kolonlu mizanpaja çevirir.
- **3 Column Page**: Sayfayı 3 kolonlu mizanpaja çevirir.
- **Picture Page**: Sayfayı tam sayfa resim düzenine sokar.
- **Big Picture Half Page**: Üst yarısı resim, alt yarısı içerik olan düzene geçer.
- **Half Page**: Sayfayı yatayda ikiye bölen mizanpaja geçer.

---
*Not: Bu sistem, kullanıcının "başka hiçbir yerle karıştırma" isteği üzerine modüler bir yapıda kurulmuştur.*

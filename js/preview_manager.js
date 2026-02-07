/**
 * MAESTRO - PREVIEW MANAGER (SİLİNECEKLER LİSTESİ)
 */

window.MaestroPreview = {
    active: false,

    // Önizleme modunda gizlenecek DOM elementleri (Selector listesi)
    hiddenElements: [
        '.page-overlay',          // Resim yükleme ve renk butonları
        '.thumb-actions',         // Thumbnail üzerindeki silme butonu
        '.thumb-left-actions',    // Thumbnail üzerindeki refresh butonu
        '.context-menu',          // Sağ tık menüleri
        '.dragging-hidden'        // Sürükleme sırasındaki elementler
    ],

    toggle: function () {
        this.active = !this.active;

        const btn = document.getElementById('previewBtn');
        if (this.active) {
            document.body.classList.add('preview-mode');
            if (btn) {
                // Button text remains PREVIEW but color changes
                btn.style.background = '#00ffcc';
                btn.style.color = '#000';
            }
        } else {
            document.body.classList.remove('preview-mode');
            if (btn) {
                btn.style.background = '';
                btn.style.color = '';
            }
        }

        // Sayfayı yeniden yükle (Canvas'ları temiz çizmek için)
        if (typeof window.loadPage === 'function' && window.currentPageId) {
            window.loadPage(window.currentPageId);
        }

        console.log(`Maestro: Preview mode ${this.active ? 'ON' : 'OFF'}`);
    }
};

// AUTO-BIND
setTimeout(() => {
    const btn = document.getElementById('previewBtn');
    if (btn) {
        btn.onclick = () => window.MaestroPreview.toggle();
    }
}, 0);

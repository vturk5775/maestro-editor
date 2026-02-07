import { state, loadPage } from './core.js';
import { saveHistory } from './history.js';
import { autoSave } from './persistence.js';
import { refreshThumb } from './pagebar.js';

export function injectPageOverlay(parent, pageIndex) {
    const page = state.pages[pageIndex];
    if (page.content || page.image) return;

    const overlay = document.createElement('div');
    overlay.className = 'page-overlay';
    overlay.innerHTML = `
        <div class="upload-zone">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            <p>RESİM YÜKLE</p>
            <input type="file" accept="image/*" class="file-input">
        </div>
    `;

    overlay.querySelector('.file-input').onchange = (e) => handleImageUpload(e, page.id);
    parent.appendChild(overlay);
}

export async function handleImageUpload(event, pageId) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const base64 = e.target.result;
        try {
            const res = await fetch('api/api_upload.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64, filename: `maestro_${Date.now()}.webp` })
            }).then(r => r.json());

            if (res.success) {
                saveHistory();
                const page = state.pages.find(p => p.id === pageId);
                if (page) {
                    page.image = res.path;
                    page.imgX = 0; page.imgY = 0; page.imgScale = 1;
                    window.loadPage(state.currentPageId);
                    autoSave();
                    refreshThumb(pageId);
                }
            } else alert("Yükleme hatası: " + res.error);
        } catch (err) { alert("Hata: " + err.message); }
    };
    reader.readAsDataURL(file);
}

export function openColorPicker(pageId, type) {
    const input = document.createElement('input');
    input.type = 'color';
    input.oninput = (e) => {
        const page = state.pages.find(p => p.id === pageId);
        if (page) {
            page.bgColor = e.target.value;
            window.loadPage(state.currentPageId);
        }
    };
    input.onchange = () => {
        saveHistory();
        autoSave();
        refreshThumb(pageId);
    };
    input.click();
}

window.injectPageOverlay = injectPageOverlay;

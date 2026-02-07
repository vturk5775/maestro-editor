import { state, loadPage, renderToCanvas, getPageLabel } from './core.js';
import { updateThumbnails, refreshThumb, deletePage, refreshAllThumbnails } from './pagebar.js';
import { saveHistory } from './history.js';
import { updateZoom, centerView } from './zoom-pan.js';
import { handleImageUpload, openColorPicker } from './image-upload.js';
import { autoSave, loadAutoSaved } from './persistence.js';
import { showProjectModal, captureCoverThumbnail } from './ui-components.js';
import { CURRENT_VERSION } from './constants.js';

// Initialize state
if (loadAutoSaved()) {
    window.loadPage(state.currentPageId);
} else {
    window.loadPage(1001);
}

// Global function binding
window.deletePage = deletePage;
window.handleImageUpload = handleImageUpload;
window.openColorPicker = openColorPicker;

// UI Event Handlers
document.getElementById('saveBtn').onclick = async (e) => {
    if (e) e.preventDefault();
    try {
        const projects = await fetch('api/api_list.php').then(r => r.json());
        showProjectModal("Proje Kaydet", projects, true, async (filename) => {
            const thumbnail = await captureCoverThumbnail();
            const projectData = { pages: state.pages, currentPageId: state.currentPageId, version: CURRENT_VERSION };
            fetch('api/api_save.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename, projectData, thumbnail })
            }).then(r => r.json()).then(res => {
                if (res.success) alert("✅ kaydedildi."); else alert("❌ Hata.");
            });
        });
    } catch (err) { alert("Hata: " + err.message); }
};

document.getElementById('loadBtn').onclick = async () => {
    try {
        const projects = await fetch('api/api_list.php').then(r => r.json());
        showProjectModal("Proje Yükle", projects, false, (filename) => {
            fetch(`saves/${filename}.json?v=${Date.now()}`).then(r => r.json()).then(data => {
                saveHistory(); state.pages = data.pages; state.currentPageId = data.currentPageId;
                window.loadPage(state.currentPageId);
                if (typeof refreshAllThumbnails === 'function') refreshAllThumbnails();
            }).catch(err => alert("Yükleme hatası: " + err.message));
        });
    } catch (err) { alert("Hata: " + err.message); }
};

// PAGE STYLE HANDLER
window.handlePageStyleAction = (action, pageId) => {
    const index = state.pages.findIndex(p => p.id == pageId);
    if (index === -1) return;
    saveHistory();
    if (action === 'bgcolor' && typeof window.openColorPicker === 'function') {
        window.openColorPicker(pageId, 'bgcolor');
    }
};

// PICTURE STYLE HANDLER
window.handlePictureStyleAction = (action, pageId) => {
    const pageIndex = state.pages.findIndex(p => p.id == pageId);
    if (pageIndex === -1) return;
    const page = state.pages[pageIndex];

    if (action === 'delete') {
        if (!confirm("Resmi silmek istediğinizden emin misiniz?")) return;
        saveHistory();
        delete page.image;
        delete page.imgX; delete page.imgY; delete page.imgScale;
        window.loadPage(state.currentPageId);
    } else if (action === 'zoomIn') {
        saveHistory();
        page.imgScale = (page.imgScale || 1) + 0.1;
        window.loadPage(state.currentPageId);
    } else if (action === 'zoomOut') {
        saveHistory();
        page.imgScale = Math.max(0.1, (page.imgScale || 1) - 0.1);
        window.loadPage(state.currentPageId);
    }
};

// Version Badge
function showVersionSplash() {
    const badge = document.createElement('div');
    badge.className = 'version-badge'; badge.innerText = CURRENT_VERSION;
    document.body.appendChild(badge);
    setTimeout(() => badge.classList.add('fade-in'), 100);
}
showVersionSplash();

// AUTO-SAVE LOOP
setInterval(() => {
    autoSave();
}, 5000);

// Global shortcut keys
window.onkeydown = (e) => {
    if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') { e.preventDefault(); document.getElementById('saveBtn').click(); }
        if (e.key === 'z') { e.preventDefault(); if (typeof window.undo === 'function') window.undo(); }
        if (e.key === 'y') { e.preventDefault(); if (typeof window.redo === 'function') window.redo(); }
    }
    if (e.key === 'p') {
        if (!e.ctrlKey && !e.metaKey && !document.querySelector('.modal-overlay')) {
            if (window.MaestroPreview) window.MaestroPreview.toggle();
        }
    }
};

window.onbeforeunload = () => {
    autoSave();
};

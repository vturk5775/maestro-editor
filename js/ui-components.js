import { state, renderToCanvas, loadPage } from './core.js';
import { saveHistory } from './history.js';

export function showProjectModal(title, projects, isSaveMode, callback) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    let recoveryHtml = '';
    if (!isSaveMode && window.MaestroRecovery && window.MaestroRecovery.hasSession()) {
        recoveryHtml = window.MaestroRecovery.getRecoveryCardHtml();
    }
    let gridHtml = projects.map(p => {
        const dateObj = new Date(p.updated_at.replace(/-/g, '/'));
        const formattedDate = dateObj.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }) + ' ' +
            dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

        return `
        <div class="project-card" data-name="${p.name}">
            <img src="${p.thumbnail}?v=${Date.now()}" alt="${p.name}">
            <div class="project-info">
                <span class="project-name">${p.name}</span>
                <div class="project-meta-row">
                    <span class="project-date">Updated: ${formattedDate}</span>
                </div>
            </div>
            ${!isSaveMode ? `<button class="delete-project-btn" title="Projeyi Sil" data-name="${p.name}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>` : ''}
        </div>
    `;
    }).join('');

    overlay.innerHTML = `
        <div class="modal-content">
            <h3>${title}</h3><div class="project-grid vertical">${recoveryHtml}${gridHtml}</div>
            ${isSaveMode ? `<div class="modal-input-area"><label>Proje Adı:</label><input type="text" class="modal-input" id="projectInput" placeholder="Yeni Proje Adı..."></div>` : ''}
            <div class="modal-buttons"><button class="modal-btn secondary" id="modalCancel">İptal</button>${isSaveMode ? `<button class="modal-btn primary" id="modalOk">Kaydet</button>` : ''}</div>
        </div>`;
    document.body.appendChild(overlay);

    overlay.querySelectorAll('.delete-project-btn').forEach(btn => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            const name = btn.dataset.name;
            if (!confirm(`'${name}' projesini silmek istediğinize emin misiniz?`)) return;
            try {
                const res = await fetch('api/api_delete.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename: name })
                }).then(r => r.json());
                if (res.success) {
                    overlay.remove();
                    const projects = await fetch('api/api_list.php').then(r => r.json());
                    showProjectModal(title, projects, isSaveMode, callback);
                } else alert("Silme hatası: " + res.error);
            } catch (err) { alert("Hata: " + err.message); }
        };
    });

    overlay.querySelector('#modalCancel').onclick = () => overlay.remove();

    if (isSaveMode) {
        const modalOk = overlay.querySelector('#modalOk');
        const projectInput = overlay.querySelector('#projectInput');

        const doSave = () => {
            const name = projectInput.value.trim();
            if (!name) { alert("Lütfen bir isim girin."); return; }

            const lowerNames = projects.map(p => p.name.toLowerCase());
            if (lowerNames.includes(name.toLowerCase())) {
                if (!confirm(`'${name}' isminde bir proje zaten var. Üzerine kaydetmek istediğinize emin misiniz?`)) {
                    return;
                }
            }

            overlay.remove();
            callback(name);
        };

        modalOk.onclick = doSave;
        projectInput.onkeydown = (e) => {
            if (e.key === 'Enter') doSave();
            if (e.key === 'Escape') overlay.remove();
        };
        setTimeout(() => projectInput.focus(), 100);
    }

    overlay.querySelectorAll('.project-card').forEach(card => {
        card.onclick = (e) => {
            if (e.target.closest('.delete-project-btn')) return;

            if (card.dataset.action === 'recover') {
                const session = window.MaestroRecovery.getSession();
                if (session) {
                    saveHistory(); state.pages = session.pages; state.currentPageId = session.currentPageId;
                    window.loadPage(state.currentPageId); overlay.remove();
                    alert("🔄 Son oturum başarıyla kurtarıldı.");
                }
                return;
            }
            const name = card.dataset.name;
            if (isSaveMode) {
                const input = overlay.querySelector('#projectInput');
                if (input) { input.value = name; input.focus(); }
            } else { overlay.remove(); callback(name); }
        };
    });
}

export async function captureCoverThumbnail() {
    return new Promise(async (resolve) => {
        const coverPage = state.pages[0];
        const tempCanvas = document.createElement('canvas');
        const dpi = 96;
        const a4Width = Math.floor(210 / 25.4 * dpi);
        const a4Height = Math.floor(297 / 25.4 * dpi);
        tempCanvas.width = a4Width / 4;
        tempCanvas.height = a4Height / 4;
        const tCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        tCtx.scale(0.25, 0.25);

        if (coverPage.image) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                renderToCanvas(tCtx, "Kapak", coverPage.content, coverPage, true);
                resolve(tempCanvas.toDataURL('image/png'));
            };
            img.onerror = () => {
                renderToCanvas(tCtx, "Kapak", coverPage.content, coverPage, true);
                resolve(tempCanvas.toDataURL('image/png'));
            };
            img.src = coverPage.image;
        } else {
            renderToCanvas(tCtx, "Kapak", coverPage.content, coverPage, true);
            resolve(tempCanvas.toDataURL('image/png'));
        }
    });
}

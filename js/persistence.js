import { state } from './core.js';
import { CURRENT_VERSION } from './constants.js';

export function autoSave() {
    const data = {
        pages: state.pages,
        currentPageId: state.currentPageId,
        version: state.version
    };
    localStorage.setItem('maestro_project', JSON.stringify(data));
    if (window.MaestroRecovery) {
        window.MaestroRecovery.saveSession(state.pages, state.currentPageId);
    }
}

export function loadAutoSaved() {
    const saved = localStorage.getItem('maestro_project');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            // Ignore older versions for a clean start if needed
            if (data.version !== CURRENT_VERSION) {
                console.log("Maestro: Eski versiyon yedeği pas geçildi, temiz sayfa açılıyor.");
                return false;
            }
            state.pages = data.pages;
            state.currentPageId = data.currentPageId;
            return true;
        } catch (e) {
            console.error("Auto-save load failed", e);
        }
    }
    return false;
}

// BIND
window.autoSave = autoSave;
window.loadAutoSaved = loadAutoSaved;

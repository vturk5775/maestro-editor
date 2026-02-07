import { state } from './core.js';

const zoomStep = 0.15;
const minZoom = 0.1;
const maxZoom = 4.0;

let startX, startY, startScrollLeft, startScrollTop;

export function updateZoom() {
    const container = document.getElementById('canvasContainer');
    if (container) {
        container.style.transform = `scale(${state.zoomLevel})`;
    }
}

export function centerView() {
    const mainArea = document.getElementById('mainArea');
    const viewport = document.getElementById('viewport');
    if (mainArea && viewport) {
        mainArea.scrollLeft = (viewport.scrollWidth - mainArea.clientWidth) / 2;
        mainArea.scrollTop = (viewport.scrollHeight - mainArea.clientHeight) / 2;
    }
}

// Global binding
window.updateZoom = updateZoom;
window.centerView = centerView;

// Event Listeners
setTimeout(() => {
    const zoomIn = document.getElementById('zoomIn');
    if (zoomIn) zoomIn.onclick = () => {
        state.zoomLevel = Math.min(maxZoom, state.zoomLevel + zoomStep);
        updateZoom();
    };

    const zoomOut = document.getElementById('zoomOut');
    if (zoomOut) zoomOut.onclick = () => {
        state.zoomLevel = Math.max(minZoom, state.zoomLevel - zoomStep);
        updateZoom();
    };

    const mainArea = document.getElementById('mainArea');
    if (mainArea) {
        mainArea.addEventListener('wheel', (e) => {
            if (e.altKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
                state.zoomLevel = Math.max(minZoom, Math.min(maxZoom, state.zoomLevel + delta));
                updateZoom();
            }
        }, { passive: false });

        mainArea.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                state.isDragging = true;
                startX = e.clientX; startY = e.clientY;
                startScrollLeft = mainArea.scrollLeft; startScrollTop = mainArea.scrollTop;
                mainArea.style.cursor = 'grabbing'; e.preventDefault();
            }
        });
    }

    window.addEventListener('mousemove', (e) => {
        if (!state.isDragging) return;
        const mainArea = document.getElementById('mainArea');
        if (mainArea) {
            mainArea.scrollLeft = startScrollLeft - (e.clientX - startX);
            mainArea.scrollTop = startScrollTop - (e.clientY - startY);
        }
    });

    window.addEventListener('mouseup', () => {
        state.isDragging = false;
        const mainArea = document.getElementById('mainArea');
        if (mainArea) mainArea.style.cursor = 'grab';
    });
}, 0);

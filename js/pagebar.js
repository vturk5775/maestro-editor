import { state, getPageLabel, renderToCanvas, loadPage, a4Width, a4Height } from './core.js';
import { saveHistory } from './history.js';
import { autoSave } from './persistence.js';

export let dragSrcEl = null;
const placeholder = document.createElement('div');
placeholder.className = 'drag-placeholder';

export function updateThumbnails() {
    const thumbnailsContainer = document.getElementById('thumbnails');
    if (!thumbnailsContainer) return;

    if (window.updateTotalPageDisplay) window.updateTotalPageDisplay(state.pages.length);

    // Incremental Update Logic (Simple Version)
    const existingThumbs = Array.from(thumbnailsContainer.querySelectorAll('.thumbnail'));

    // If count changed or empty, full re-render
    if (existingThumbs.length !== state.pages.length) {
        thumbnailsContainer.innerHTML = '';
        state.pages.forEach((page, index) => {
            const thumb = createThumbElement(page, index);
            thumbnailsContainer.appendChild(thumb);
        });
    } else {
        // Just update classes and labels
        existingThumbs.forEach((thumb, index) => {
            const page = state.pages[index];
            thumb.dataset.id = page.id;
            thumb.dataset.index = index;
            const label = getPageLabel(index);
            thumb.setAttribute('data-page-num', label);

            if (page.id === state.currentPageId) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }

            // Sync image if cache changed
            const cacheKey = `${page.id}-${page.content}`;
            const img = thumb.querySelector('img');
            if (img && state.thumbCache.has(cacheKey)) {
                if (img.src !== state.thumbCache.get(cacheKey)) {
                    img.src = state.thumbCache.get(cacheKey);
                }
            }
        });
    }
}

function createThumbElement(page, index) {
    const thumb = document.createElement('div');
    thumb.className = 'thumbnail' + (page.id === state.currentPageId ? ' active' : '');
    thumb.setAttribute('draggable', true);
    thumb.dataset.id = page.id;
    thumb.dataset.index = index;
    const displayLabel = getPageLabel(index);
    thumb.setAttribute('data-page-num', displayLabel);

    thumb.addEventListener('dragstart', handleDragStart);
    thumb.addEventListener('dragover', handleDragOver);
    thumb.addEventListener('drop', handleDrop);
    thumb.addEventListener('dragend', handleDragEnd);

    const cacheKey = `${page.id}-${page.content}`;
    let thumbDataUrl;
    if (state.thumbCache.has(cacheKey)) {
        thumbDataUrl = state.thumbCache.get(cacheKey);
    } else {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 160; tempCanvas.height = 226;
        const tCtx = tempCanvas.getContext('2d');
        tCtx.fillStyle = '#ffffff'; tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tCtx.fillStyle = '#000'; tCtx.font = 'bold 60px Arial'; tCtx.textAlign = 'center';
        tCtx.fillText(displayLabel === "K" || displayLabel === "B" ? displayLabel : page.content, tempCanvas.width / 2, tempCanvas.height / 2 + 20);
        thumbDataUrl = tempCanvas.toDataURL();
        state.thumbCache.set(cacheKey, thumbDataUrl);
    }

    const img = document.createElement('img');
    img.src = thumbDataUrl; img.loading = "lazy";
    thumb.appendChild(img);

    const leftActions = document.createElement('div');
    leftActions.className = 'thumb-left-actions';
    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'refresh-btn';
    refreshBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`;
    refreshBtn.onclick = (e) => { e.stopPropagation(); refreshThumb(page.id, cacheKey); };
    leftActions.appendChild(refreshBtn);
    thumb.appendChild(leftActions);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = `&times;`;
    deleteBtn.onclick = (e) => { e.stopPropagation(); window.deletePage(page.id); };
    thumb.appendChild(deleteBtn);

    thumb.onclick = () => { state.currentPageId = page.id; window.loadPage(page.id); };
    return thumb;
}

export async function refreshThumb(pageId, cacheKey) {
    const pageIndex = state.pages.findIndex(p => p.id === pageId);
    if (pageIndex === -1) return;
    const page = state.pages[pageIndex];
    if (!cacheKey) cacheKey = `${page.id}-${page.content}`;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = a4Width; tempCanvas.height = a4Height;
    const tCtx = tempCanvas.getContext('2d');

    if (page.image && (!state.imgCache[page.image] || !state.imgCache[page.image].complete)) {
        await new Promise(resolve => {
            const img = new Image();
            img.onload = () => { state.imgCache[page.image] = img; resolve(); };
            img.src = page.image;
        });
    }

    renderToCanvas(tCtx, getPageLabel(pageIndex), page.content, page, true);
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = 160; finalCanvas.height = 226;
    const fCtx = finalCanvas.getContext('2d');
    fCtx.drawImage(tempCanvas, 0, 0, 160, 226);

    state.thumbCache.set(cacheKey, finalCanvas.toDataURL('image/jpeg', 0.8));
    updateThumbnails();
}

export async function refreshAllThumbnails() {
    state.thumbCache.clear();
    for (const page of state.pages) {
        await refreshThumb(page.id);
    }
}

function handleDragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => { if (this && this.classList) this.classList.add('dragging-hidden'); }, 0);
}

function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const thumbnailsContainer = document.getElementById('thumbnails');
    if (!thumbnailsContainer) return;

    const afterElement = getDragAfterElement(thumbnailsContainer, e.clientY);
    if (afterElement == null) {
        if (thumbnailsContainer.lastElementChild !== placeholder) {
            thumbnailsContainer.appendChild(placeholder);
        }
    } else {
        if (afterElement !== placeholder && afterElement.previousElementSibling !== placeholder) {
            thumbnailsContainer.insertBefore(placeholder, afterElement);
        }
    }
    return false;
}

function getDragAfterElement(container, y) {
    if (!container) return null;
    const draggableElements = [...container.querySelectorAll('.thumbnail:not(.dragging-hidden)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) return { offset: offset, element: child };
        return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function handleDrop(e) {
    if (e.preventDefault) e.preventDefault();
    e.stopPropagation();
    const thumbnailsContainer = document.getElementById('thumbnails');
    if (!placeholder.parentNode || !dragSrcEl) {
        handleDragEnd.call(dragSrcEl);
        return false;
    }

    saveHistory();
    const children = Array.from(thumbnailsContainer.children);
    const newPagesOrder = [];
    children.forEach(child => {
        if (child === placeholder) {
            const srcIdx = parseInt(dragSrcEl.dataset.index);
            newPagesOrder.push(state.pages[srcIdx]);
        } else if (child.classList.contains('thumbnail') && !child.classList.contains('dragging-hidden')) {
            const idx = parseInt(child.dataset.index);
            newPagesOrder.push(state.pages[idx]);
        }
    });

    if (newPagesOrder.length === state.pages.length) {
        state.pages = newPagesOrder;
        window.pages = state.pages;
    }
    handleDragEnd.call(dragSrcEl);
    return false;
}

function handleDragEnd() {
    if (this && this.classList) this.classList.remove('dragging-hidden');
    if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
    updateThumbnails();
}

export function deletePage(pageId) {
    if (state.pages.length <= 1) return alert('En az bir sayfa kalmalı!');
    saveHistory();
    const index = state.pages.findIndex(p => p.id === pageId);
    if (index === -1) return;
    state.pages.splice(index, 1);
    if (state.currentPageId === pageId) {
        const nextTarget = state.pages[index] || state.pages[state.pages.length - 1];
        state.currentPageId = nextTarget.id;
    }
    window.loadPage(state.currentPageId);
}

export function addPage() {
    saveHistory();
    const newId = Date.now();
    const content = String.fromCharCode(65 + (state.pages.length % 26));
    state.pages.push({ id: newId, content: content });
    window.loadPage(newId);
}

export function insertPage() {
    const index = state.pages.findIndex(p => p.id === state.currentPageId);
    if (index === -1) return;
    saveHistory();
    const newId = Date.now();
    const content = String.fromCharCode(65 + (state.pages.length % 26));
    state.pages.splice(index + 1, 0, { id: newId, content: content });
    updateThumbnails();
    window.loadPage(newId);
}

window.refreshThumb = refreshThumb;
window.updateThumbnails = updateThumbnails;
window.refreshAllThumbnails = refreshAllThumbnails;

setTimeout(() => {
    const thumbnailsContainer = document.getElementById('thumbnails');
    if (thumbnailsContainer) {
        thumbnailsContainer.addEventListener('dragover', handleDragOver);
        thumbnailsContainer.addEventListener('drop', handleDrop);
    }
    const addBtn = document.getElementById('addPage');
    if (addBtn) addBtn.onclick = addPage;
    const insBtn = document.getElementById('insertPage');
    if (insBtn) insBtn.onclick = insertPage;
}, 0);

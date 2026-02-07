import { A4_WIDTH, A4_HEIGHT, CURRENT_VERSION } from './constants.js';

// ==========================================================
// CONFIG & SHARED STATE
// ==========================================================

export let state = {
    pages: [
        { id: 1001, content: 'K' }
    ],
    currentPageId: 1001,
    zoomLevel: 0.8,
    isDragging: false,
    editingPageIndex: -1,
    tempTransform: { x: 0, y: 0, scale: 1 },
    imgCache: {},
    thumbCache: new Map(),
    version: CURRENT_VERSION
};

export const a4Width = A4_WIDTH;
export const a4Height = A4_HEIGHT;

// HELPERS
export function getPageLabel(index) {
    if (index === 0) return "K";
    if (index === 1) return "B";
    return (index - 1).toString().padStart(2, '0');
}

// CORE RENDER
export function renderToCanvas(ctx, title, content, pageData = {}, forceLabels = false) {
    if (!ctx) return;
    ctx.fillStyle = pageData.bgColor || '#ffffff';
    ctx.fillRect(0, 0, a4Width, a4Height);

    if (pageData.image) {
        let cachedImg = state.imgCache[pageData.image];

        const drawImg = (imgObj) => {
            const pageIndex = state.pages.findIndex(p => p.id === pageData.id);
            const isEditingThis = (pageIndex === state.editingPageIndex);

            const dx = isEditingThis ? state.tempTransform.x : (pageData.imgX || 0);
            const dy = isEditingThis ? state.tempTransform.y : (pageData.imgY || 0);
            const dScale = isEditingThis ? state.tempTransform.scale : (pageData.imgScale || 1);

            const baseScale = Math.min(a4Width / imgObj.width, a4Height / imgObj.height);
            const finalScale = baseScale * dScale;

            const x = (a4Width - imgObj.width * finalScale) / 2 + dx;
            const y = (a4Height - imgObj.height * finalScale) / 2 + dy;

            ctx.drawImage(imgObj, x, y, imgObj.width * finalScale, imgObj.height * finalScale);
        };

        if (cachedImg && cachedImg.complete) {
            drawImg(cachedImg);
        } else {
            const img = new Image();
            img.onload = () => {
                state.imgCache[pageData.image] = img;
                drawImg(img);
            };
            img.src = pageData.image;
        }
    }

    const isPreview = window.MaestroPreview && window.MaestroPreview.active === true;
    if (!isPreview || forceLabels) {
        ctx.save();
        ctx.fillStyle = '#666';
        ctx.font = '24px Arial';
        ctx.fillText(title, 40, 60);
        if (content) {
            ctx.fillStyle = '#000';
            ctx.font = 'bold 150px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(content, a4Width / 2, a4Height / 2);
        }
        ctx.restore();
    }
}

export function loadPage(pageId) {
    const container = document.getElementById('canvasContainer');
    const canvasLeft = document.getElementById('canvasLeft');
    const canvasRight = document.getElementById('canvasRight');
    if (!canvasLeft || !canvasRight || !container) return;

    // Set dimensions
    canvasLeft.width = a4Width;
    canvasLeft.height = a4Height;
    canvasRight.width = a4Width;
    canvasRight.height = a4Height;

    const ctxLeft = canvasLeft.getContext('2d');
    const ctxRight = canvasRight.getContext('2d');

    state.currentPageId = pageId || state.pages[0].id;
    const index = state.pages.findIndex(p => p.id === state.currentPageId);
    if (index === -1) return;

    let leftIndex, rightIndex;
    if (index === 0) {
        leftIndex = -1;
        rightIndex = 0;
        container.style.background = 'transparent';
        container.style.border = 'none';
        container.style.boxShadow = 'none';
    } else {
        leftIndex = index % 2 === 1 ? index : index - 1;
        rightIndex = leftIndex + 1;
        container.style.background = 'white';
        container.style.border = '1px solid #ddd';
        container.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.6)';
    }

    const leftHalf = document.querySelector('.a4-half:first-child');
    const rightHalf = document.querySelector('.a4-half:last-child');
    const leftShadow = leftHalf ? leftHalf.querySelector('.spread-shadow') : null;
    const rightShadow = rightHalf ? rightHalf.querySelector('.spread-shadow') : null;
    const leftPage = state.pages[leftIndex];
    const rightPage = state.pages[rightIndex];

    document.querySelectorAll('.page-overlay').forEach(el => el.remove());

    if (leftPage && leftHalf) {
        const label = getPageLabel(leftIndex);
        renderToCanvas(ctxLeft, label === "K" ? "Kapak" : (label === "B" ? "Boş Sayfa" : `Sayfa ${label}`), leftPage.content, leftPage);
        leftHalf.style.visibility = 'visible';
        leftHalf.style.background = leftPage.bgColor || 'white';
        leftHalf.setAttribute('data-label', label);
        if (leftShadow) leftShadow.style.display = (index === 0) ? 'none' : 'block';
        if (!leftPage.content && !leftPage.image && typeof window.injectPageOverlay === 'function') {
            window.injectPageOverlay(leftHalf, leftIndex);
        }
    } else if (leftHalf) {
        leftHalf.style.visibility = 'hidden';
        leftHalf.setAttribute('data-label', '');
        if (leftShadow) leftShadow.style.display = 'none';
    }

    if (rightPage && rightHalf) {
        const label = getPageLabel(rightIndex);
        renderToCanvas(ctxRight, label === "K" ? "Kapak" : (label === "B" ? "Boş Sayfa" : `Sayfa ${label}`), rightPage.content, rightPage);
        rightHalf.style.visibility = 'visible';
        rightHalf.style.background = rightPage.bgColor || 'white';
        rightHalf.setAttribute('data-label', label);
        if (rightShadow) rightShadow.style.display = (index === 0) ? 'none' : 'block';
        if (!rightPage.content && !rightPage.image && typeof window.injectPageOverlay === 'function') {
            window.injectPageOverlay(rightHalf, rightIndex);
        }
    } else if (rightHalf) {
        rightHalf.style.visibility = 'hidden';
        rightHalf.setAttribute('data-label', '');
        if (rightShadow) rightShadow.style.display = 'none';
    }

    if (typeof window.updateThumbnails === 'function') window.updateThumbnails();

    const activeThumb = document.querySelector('.thumbnail.active');
    if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    window.currentPageId = state.currentPageId;
    window.pages = state.pages;
}

// BIND GLOBAL
window.loadPage = loadPage;
window.renderToCanvas = renderToCanvas;
window.getPageLabel = getPageLabel;

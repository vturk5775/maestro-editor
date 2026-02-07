// Maestro - Isolated Picture Style Context Menu System

(function () {
    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.style.borderColor = '#00ffcc'; // Distinct border
    contextMenu.innerHTML = `
        <h4>Picture Object</h4>
        <div class="menu-item" data-action="edit-image">
            <span>Edit (Scale/Move)</span>
        </div>
        <div class="menu-item" data-action="cancel">
            <span>Cancel</span>
        </div>
    `;
    document.body.appendChild(contextMenu);

    let targetHalfIdx = null; // 0 for left, 1 for right

    // Listen for right-click on A4 halves that HAVE an image
    document.addEventListener('contextmenu', function (e) {
        const half = e.target.closest('.a4-half');
        if (half) {
            // Check if this half has an image in current pages
            const isLeft = half === document.querySelector('.a4-half:first-child');
            const targetIdx = getVisiblePageIndex(isLeft ? 'left' : 'right');

            if (targetIdx !== -1 && pages[targetIdx] && pages[targetIdx].image) {
                e.preventDefault();
                targetHalfIdx = isLeft ? 0 : 1;

                const { clientX: mouseX, clientY: mouseY } = e;
                contextMenu.style.top = `${mouseY}px`;
                contextMenu.style.left = `${mouseX}px`;
                contextMenu.style.display = 'block';
            } else {
                contextMenu.style.display = 'none';
            }
        } else {
            contextMenu.style.display = 'none';
        }
    });

    // Close menu on click outside
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.context-menu')) {
            contextMenu.style.display = 'none';
        }
    });

    // Handle menu actions
    contextMenu.addEventListener('click', function (e) {
        const item = e.target.closest('.menu-item');
        if (!item) return;

        const action = item.dataset.action;
        contextMenu.style.display = 'none';

        if (action === 'edit-image') {
            if (typeof enterImageEditMode === 'function') {
                enterImageEditMode(targetHalfIdx);
            }
        } else if (action === 'cancel') {
            if (typeof handleImageCancel === 'function') {
                handleImageCancel(targetHalfIdx);
            }
        }
    });
})();

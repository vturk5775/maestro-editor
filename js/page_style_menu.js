// Maestro - Isolated Page Style Context Menu System
// Documentation: See PAGE_STYLE_MENU.md

(function () {
    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.innerHTML = `
        <h4>Page Style</h4>
        <div class="menu-item" data-action="empty">
            <span>Empty Page</span>
        </div>
        <div class="menu-item" data-action="2-column">
            <span>2 Column Page</span>
        </div>
        <div class="menu-item" data-action="3-column">
            <span>3 Column Page</span>
        </div>
        <div class="menu-item" data-action="picture">
            <span>Picture Page</span>
        </div>
        <div class="menu-item" data-action="big-picture-half">
            <span>Big Picture Half Page</span>
        </div>
        <div class="menu-item" data-action="half">
            <span>Half Page</span>
        </div>
    `;
    document.body.appendChild(contextMenu);

    let targetPageId = null;

    // Listen for right-click on thumbnails
    document.addEventListener('contextmenu', function (e) {
        const thumb = e.target.closest('.thumbnail');
        if (thumb) {
            e.preventDefault();
            targetPageId = thumb.dataset.id;

            const { clientX: mouseX, clientY: mouseY } = e;
            contextMenu.style.top = `${mouseY}px`;
            contextMenu.style.left = `${mouseX}px`;
            contextMenu.style.display = 'block';

            // Ensure menu stays within viewport
            const menuRect = contextMenu.getBoundingClientRect();
            if (menuRect.right > window.innerWidth) {
                contextMenu.style.left = `${window.innerWidth - menuRect.width - 5}px`;
            }
            if (menuRect.bottom > window.innerHeight) {
                contextMenu.style.top = `${window.innerHeight - menuRect.height - 5}px`;
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

        // This communicates with the main app.js via global function calls if available
        // or executes logic directly on the page array
        if (typeof handlePageStyleAction === 'function') {
            handlePageStyleAction(action, targetPageId);
        } else {
            console.warn("handlePageStyleAction not found in global scope.");
        }
    });

    // Export a utility to update the Total Page counter
    window.updateTotalPageDisplay = function (count) {
        const display = document.getElementById('totalPageDisplay');
        if (display) {
            display.innerText = `Total Page: ${count}`;
        }
    };
})();

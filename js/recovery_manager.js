/**
 * MAESTRO - RECOVERY MANAGER
 * Arka planda localStorage üzerinde sessiz yedek tutar ve InDesign benzeri kurtarma imkanı sunar.
 */

window.MaestroRecovery = {
    STORAGE_KEY: 'maestro_persistent_session',

    // Arka planda sessizce yedekle
    saveSession: function (pages, currentPageId) {
        const data = {
            pages: pages,
            currentPageId: currentPageId,
            timestamp: Date.now(),
            version: 'RECOVERY_1.0'
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        // console.log("Maestro: Arka plan yedeği güncellendi.");
    },

    // Kurtarılacak veri var mı kontrol et
    hasSession: function () {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        return !!saved;
    },

    // Veriyi getir
    getSession: function () {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (!saved) return null;
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error("Maestro: Kurtarma verisi okunamadı.", e);
            return null;
        }
    },

    // Kurtarma kartı için HTML üret
    getRecoveryCardHtml: function () {
        const data = this.getSession();
        if (!data) return '';

        const date = new Date(data.timestamp).toLocaleString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit'
        });

        return `
            <div class="project-card recovery-card" data-action="recover">
                <div class="recovery-icon">🔄</div>
                <div class="project-info">
                    <span class="project-name">SON ÇALIŞMAYI KURTAR</span>
                    <div class="project-meta-row">
                        <span class="project-date">Otomatik Kayıt: ${date}</span>
                        <span class="project-badge recovery-badge">AUTOSAVE</span>
                    </div>
                </div>
            </div>
        `;
    }
};

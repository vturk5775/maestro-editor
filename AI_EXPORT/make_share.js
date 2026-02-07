const fs = require('fs');
const path = require('fs');
const pathNode = require('path');

// 1. Dosyaları oku (Üst klasörden)
const htmlPath = pathNode.join(__dirname, '..', 'index.html');
const stylePath = pathNode.join(__dirname, '..', 'css', 'style.css');
const pagebarPath = pathNode.join(__dirname, '..', 'css', 'pagebar.css');
const appPath = pathNode.join(__dirname, '..', 'js', 'app.js');
const contextPath = pathNode.join(__dirname, 'PROJECT_CONTEXT_FOR_AI.txt');

const html = fs.readFileSync(htmlPath, 'utf8');
const style = fs.readFileSync(stylePath, 'utf8');
const pagebar = fs.readFileSync(pagebarPath, 'utf8');
const app = fs.readFileSync(appPath, 'utf8');
const projectContext = fs.readFileSync(contextPath, 'utf8');

// 2. share.html oluştur (Bundle)
let shareHtml = html;

// CSS'leri göm
const cssBundle = `<style>\n${style}\n${pagebar}\n</style>`;
shareHtml = shareHtml.replace('<link rel="stylesheet" href="./css/style.css?v=37">', '');
shareHtml = shareHtml.replace('<link rel="stylesheet" href="./css/pagebar.css?v=37">', cssBundle);

// JS'i göm (Temiz, yorumsuz)
const jsBundle = `<script>\n${app}\n</script>`;
shareHtml = shareHtml.replace('<script src="./js/app.js?v=37" type="module"></script>', jsBundle);
// Ayrıca diğer JS'leri de şimdilik çıkaralım bundle'dan veya onları da ekle (tertemiz share için)
shareHtml = shareHtml.replace('<script src="./js/recovery_manager.js?v=37"></script>', '');
shareHtml = shareHtml.replace('<script src="./js/preview_manager.js?v=37"></script>', '');
shareHtml = shareHtml.replace('<script src="./js/page_style_menu.js?v=37"></script>', '');
shareHtml = shareHtml.replace('<script src="./js/picture_style_menu.js?v=37"></script>', '');

// AI CONTEXT'İ TAMAMEN GİZLİ BİR ETİKETE GÖM (BODY BİTMEDEN HEMEN ÖNCE)
const hiddenContext = `
<!-- 
     GROK/AI ANALİZİ İÇİN GİZLİ PROJE VERİSİ 
     Aşağıdaki div tamamen gizlidir, sadece kaynak kodda görünür.
-->
<div id="ai-project-context" style="display:none !important;" aria-hidden="true">
${projectContext.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
</div>
`;

shareHtml = shareHtml.replace('</body>', `${hiddenContext}\n</body>`);

// Dosyayı AI_EXPORT klasörüne yaz
fs.writeFileSync(pathNode.join(__dirname, 'share.html'), shareHtml);
console.log("✅ share.html TERTEMİZ hale getirildi ve AI_EXPORT klasörüne kaydedildi.");

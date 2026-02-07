const fs = require('fs');
const path = require('path');

// Paketlenecek dosyalar listesi (Üst klasördekiler)
const filesToPack = [
    'index.html',
    'css/style.css',
    'css/pagebar.css',
    'js/app.js'
];

const outputFile = path.join(__dirname, 'PROJECT_CONTEXT_FOR_AI.txt');
let packedContent = `# MAESTRO PROJECT CONTEXT\n\nGenerated on: ${new Date().toLocaleString()}\n\n`;

filesToPack.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const ext = path.extname(file).substring(1);
        packedContent += `## File: ${file}\n\n\`\`\`${ext}\n${content}\n\`\`\`\n\n---\n\n`;
    }
});

fs.writeFileSync(outputFile, packedContent);
console.log(`✅ Proje başarıyla paketlendi: AI_EXPORT/PROJECT_CONTEXT_FOR_AI.txt`);

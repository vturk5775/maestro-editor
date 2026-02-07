const fs = require('fs');
const path = require('path');

// Backup name with timestamp
const now = new Date();
const timestamp = now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') + '_' +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');

const backupDir = path.join(__dirname, '..', 'YEDEK', `maestro_backup_${timestamp}`);

// Files and folders to include
const targets = [
    'index.html',
    'css/',
    'js/',
    'api/',
    'docs/',
    'assets/',
    'AI_EXPORT/',
    'scripts/',
    'saves/',
    'Links/'
];

function copyFolderSync(from, to) {
    if (!fs.existsSync(from)) return;
    fs.mkdirSync(to, { recursive: true });
    fs.readdirSync(from).forEach(element => {
        if (fs.lstatSync(path.join(from, element)).isFile()) {
            fs.copyFileSync(path.join(from, element), path.join(to, element));
        } else {
            copyFolderSync(path.join(from, element), path.join(to, element));
        }
    });
}

console.log(`🚀 Yedekleme başlatılıyor: ${backupDir}`);

if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

targets.forEach(target => {
    const src = path.join(__dirname, '..', target);
    const dest = path.join(backupDir, target);

    if (fs.existsSync(src)) {
        if (fs.lstatSync(src).isDirectory()) {
            copyFolderSync(src, dest);
        } else {
            fs.copyFileSync(src, dest);
        }
        console.log(`✅ Kopyalandı: ${target}`);
    }
});

console.log(`🎉 Yedekleme başarıyla tamamlandı!`);

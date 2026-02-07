<?php
// API: Server'daki Projeleri Detaylı Listele
header('Content-Type: application/json');

$dir = '../saves/';
$projects = [];

if (is_dir($dir)) {
    $files = scandir($dir);
    foreach ($files as $file) {
        if (pathinfo($file, PATHINFO_EXTENSION) === 'json') {
            $content = json_decode(file_get_contents($dir . $file), true);
            if ($content && isset($content['metadata'])) {
                $projects[] = $content['metadata'];
            }
        }
    }
}

// Tarihe göre sırala (en yeni üstte)
usort($projects, function ($a, $b) {
    return strtotime($b['updated_at']) - strtotime($a['updated_at']);
});

echo json_encode($projects);
?>
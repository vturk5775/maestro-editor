<?php
// API: Proje ve Thumbnail Sil
header('Content-Type: application/json');

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data || !isset($data['filename'])) {
    echo json_encode(['error' => 'Geçersiz veri.']);
    exit;
}

$filename = preg_replace('/[^a-zA-Z0-9_-]/', '', $data['filename']);
$saveDirFS = '../saves/';

$projectPath = $saveDirFS . $filename . '.json';
$thumbPathFS = $saveDirFS . $filename . '.png';

$deletedJson = false;
$deletedPng = false;

if (file_exists($projectPath)) {
    unlink($projectPath);
    $deletedJson = true;
}

if (file_exists($thumbPathFS)) {
    unlink($thumbPathFS);
    $deletedPng = true;
}

if ($deletedJson || $deletedPng) {
    echo json_encode(['success' => true, 'message' => 'Proje silindi.']);
} else {
    echo json_encode(['error' => 'Dosya bulunamadı.']);
}
?>
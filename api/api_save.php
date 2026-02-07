<?php
// API: Dosyayı Server'a Kaydet + Thumbnail
header('Content-Type: application/json');

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data || !isset($data['filename'])) {
    echo json_encode(['error' => 'Geçersiz veri.']);
    exit;
}

$filename = preg_replace('/[^a-zA-Z0-9_-]/', '', $data['filename']);
$saveDirFS = '../saves/'; // FS path
$saveDirWeb = 'saves/';    // Web path
if (!is_dir($saveDirFS))
    mkdir($saveDirFS, 0777, true);

$projectPath = $saveDirFS . $filename . '.json';
$thumbPathWeb = $saveDirWeb . $filename . '.png';
$thumbPathFS = $saveDirFS . $filename . '.png';

// Metadata ekle
$projectData = $data['projectData'];
$isUpdate = file_exists($projectPath);
$projectData['metadata'] = [
    'name' => $data['filename'],
    'created_at' => $isUpdate ? json_decode(file_get_contents($projectPath), true)['metadata']['created_at'] : date('Y-m-d H:i:s'),
    'updated_at' => date('Y-m-d H:i:s'),
    'thumbnail' => $thumbPathWeb
];

// JSON Kaydet
file_put_contents($projectPath, json_encode($projectData, JSON_PRETTY_PRINT));

// Thumbnail Kaydet (Base64'den PNG'ye)
if (isset($data['thumbnail'])) {
    $thumbData = str_replace('data:image/png;base64,', '', $data['thumbnail']);
    $thumbData = str_replace(' ', '+', $thumbData);
    file_put_contents($thumbPathFS, base64_decode($thumbData));
}

echo json_encode(['success' => true, 'message' => 'Proje ve Kapak kaydedildi.']);
?>
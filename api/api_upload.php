<?php
header('Content-Type: application/json');

$targetDir = "../Links/"; // FS path
$webDir = "Links/";      // Web path for frontend
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['image']) && isset($data['filename'])) {
    $img = $data['image'];
    $filename = $data['filename'];

    // Remove headers
    $img = str_replace('data:image/webp;base64,', '', $img);
    $img = str_replace(' ', '+', $img);
    $fileData = base64_decode($img);

    // Save as webp
    $fullPath = $targetDir . $filename;

    if (file_put_contents($fullPath, $fileData)) {
        echo json_encode(['success' => true, 'path' => $webDir . $filename]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Dosya yazılamadı.']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Geçersiz veri.']);
}
?>
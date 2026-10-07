<?php
/**
 * Приём заявок MONOCHROME.
 * Настройки берутся из переменных окружения или из файла вне веб-корня
 * (путь в MC_CONFIG, по умолчанию ../../mc-config.php), например:
 *   <?php return ['tg_token' => '...', 'tg_chat' => '...', 'mail_to' => 'owner@example.com'];
 * Токены и адреса в репозиторий и во фронтенд не попадают.
 */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function respond(int $code, array $data): void { http_response_code($code); echo json_encode($data, JSON_UNESCAPED_UNICODE); exit; }
function logLine(string $status, string $id): void {
    // В журнал — только статус, время и технический id, без персональных данных
    @file_put_contents(__DIR__ . '/../../mc-leads.log', date('c') . "\t$id\t$status\n", FILE_APPEND | LOCK_EX);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, ['ok' => false]);
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 55 * 1024 * 1024) respond(413, ['ok' => false, 'error' => 'too_large']);

$cfgFile = getenv('MC_CONFIG') ?: __DIR__ . '/../../mc-config.php';
$cfg = is_file($cfgFile) ? (array)require $cfgFile : [];
$cfg += ['tg_token' => getenv('MC_TG_TOKEN') ?: '', 'tg_chat' => getenv('MC_TG_CHAT') ?: '', 'mail_to' => getenv('MC_MAIL_TO') ?: ''];

// Honeypot
if (!empty($_POST['website'])) respond(200, ['ok' => true, 'lead_id' => 'x']);

// Rate limit: 5 заявок с IP за 10 минут
$ipHash = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . 'mc');
$rlFile = sys_get_temp_dir() . '/mc_rl_' . substr($ipHash, 0, 16);
$hits = array_filter(is_file($rlFile) ? (array)json_decode((string)file_get_contents($rlFile), true) : [], fn($t) => $t > time() - 600);
if (count($hits) >= 5) respond(429, ['ok' => false, 'error' => 'rate_limit']);

$clean = fn(string $k, int $max) => mb_substr(trim(strip_tags((string)($_POST[$k] ?? ''))), 0, $max);
$name = $clean('name', 60);
$phoneDigits = preg_replace('/\D/', '', (string)($_POST['phone'] ?? ''));
$car = $clean('car', 80);
$year = $clean('year', 4);
$comment = $clean('comment', 1000);
$service = in_array($_POST['service'] ?? '', ['film', 'antikor', 'both', 'consult'], true) ? $_POST['service'] : 'consult';
$isService = in_array($_POST['service'] ?? '', ['film', 'antikor'], true) && isset($_POST['car']);

$allowedOptions = [
    'package_id' => ['risk', 'front', 'full', 'custom', 'unknown'],
    'condition_id' => ['prevent', 'used', 'renew', 'unknown'],
];
$option = '';
foreach ($allowedOptions as $field => $values) {
    if (isset($_POST[$field])) {
        if (!in_array($_POST[$field], $values, true)) respond(422, ['ok' => false, 'errors' => [$field => 'Неизвестный вариант']]);
        $option = $field . ': ' . $_POST[$field];
    }
}

$errors = [];
if (mb_strlen($name) < 2) $errors['name'] = 'Укажите имя';
if (strlen($phoneDigits) < 10 || strlen($phoneDigits) > 15) $errors['phone'] = 'Проверьте номер телефона';
if ($isService && mb_strlen($car) < 2) $errors['car'] = 'Укажите марку и модель';
if ($year !== '' && (!ctype_digit($year) || (int)$year < 1950 || (int)$year > (int)date('Y') + 1)) $errors['year'] = 'Проверьте год';
if (empty($_POST['consent'])) $errors['consent'] = 'Нужно согласие на обработку данных';
if ($errors) respond(422, ['ok' => false, 'errors' => $errors]);

// Защита от двойной отправки: одинаковая заявка за 2 минуты не дублируется
$dupKey = sys_get_temp_dir() . '/mc_dup_' . hash('sha256', $phoneDigits . $service . $option);
if (is_file($dupKey) && filemtime($dupKey) > time() - 120) respond(200, ['ok' => true, 'lead_id' => (string)file_get_contents($dupKey)]);

// Фото
$photos = [];
if (!empty($_FILES['photos']['name'][0])) {
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    foreach ($_FILES['photos']['tmp_name'] as $i => $tmp) {
        if ($i >= 5) break;
        if ($_FILES['photos']['error'][$i] !== UPLOAD_ERR_OK || $_FILES['photos']['size'][$i] > 10 * 1024 * 1024) continue;
        $ext = strtolower(pathinfo($_FILES['photos']['name'][$i], PATHINFO_EXTENSION));
        $mime = $finfo->file($tmp);
        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'heic'], true) || !in_array($mime, ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'application/octet-stream'], true)) continue;
        $photos[] = ['path' => $tmp, 'name' => 'photo' . ($i + 1) . '.' . $ext, 'mime' => $mime];
    }
}

$leadId = date('ymd-His') . '-' . substr(bin2hex(random_bytes(3)), 0, 6);
$labels = ['film' => 'Оклейка плёнкой', 'antikor' => 'Антикор', 'both' => 'Оклейка и антикор', 'consult' => 'Консультация'];
$text = "Заявка $leadId\n"
    . "Услуга: {$labels[$service]}\n"
    . "Имя: $name\nТелефон: +$phoneDigits\n"
    . ($car ? "Авто: $car" . ($year ? ", $year" : '') . "\n" : '')
    . ($option ? "$option\n" : '')
    . (!empty($_POST['zones']) ? 'Детали: ' . $clean('zones', 500) . "\n" : '')
    . (!empty($_POST['car_type']) ? 'Тип авто: ' . $clean('car_type', 20) . "\n" : '')
    . ($comment ? "Комментарий: $comment\n" : '')
    . 'Страница: ' . $clean('page_url', 300) . "\n"
    . 'Источник: ' . $clean('referrer', 300) . "\n"
    . 'UTM: ' . $clean('utm', 500) . "\n"
    . 'Metrika client_id: ' . $clean('client_id', 40);

$delivered = false;
if ($cfg['tg_token'] && $cfg['tg_chat']) {
    $api = 'https://api.telegram.org/bot' . $cfg['tg_token'];
    $post = function (string $method, array $fields) use ($api): bool {
        $ch = curl_init("$api/$method");
        curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => $fields, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 15]);
        $res = json_decode((string)curl_exec($ch), true);
        curl_close($ch);
        return !empty($res['ok']);
    };
    $delivered = $post('sendMessage', ['chat_id' => $cfg['tg_chat'], 'text' => $text]);
    foreach ($photos as $p) {
        $post('sendDocument', ['chat_id' => $cfg['tg_chat'], 'caption' => $leadId, 'document' => new CURLFile($p['path'], $p['mime'], $p['name'])]);
    }
}
if (!$delivered && $cfg['mail_to']) {
    $delivered = mail($cfg['mail_to'], '=?UTF-8?B?' . base64_encode("Заявка MONOCHROME $leadId") . '?=', $text, "Content-Type: text/plain; charset=utf-8\r\n");
}

logLine($delivered ? 'delivered' : 'failed', $leadId);
if (!$delivered) respond(502, ['ok' => false, 'error' => 'delivery']);

$hits[] = time();
@file_put_contents($rlFile, json_encode(array_values($hits)));
@file_put_contents($dupKey, $leadId);
respond(200, ['ok' => true, 'lead_id' => $leadId]);

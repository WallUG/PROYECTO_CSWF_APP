<?php

$host = "sql102.infinityfree.com";
$db   = "if0_41322465_db_taller";
$user = "if0_412342341365";
$pass = "cW84234234Md17I";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Error conexión: " . $conn->connect_error);
}

$conn->set_charset("utf8");
?>
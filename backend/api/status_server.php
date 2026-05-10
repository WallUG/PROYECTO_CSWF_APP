<?php

require_once __DIR__ . '/cors.php';
include(__DIR__ . "/../config/db.php");

$response = [
    "status" => true,
    "message" => "Backend funcionando",
    "mysql" => false
];

$sql = "SELECT NOW() AS server_time";

$result = $conn->query($sql);

if ($result) {

    $row = $result->fetch_assoc();

    $response["mysql"] = true;
    $response["server_time"] = $row["server_time"];
}

echo json_encode($response, JSON_PRETTY_PRINT);
<?php
// Archivo: /middlewares/AuthMiddleware.php

class AuthMiddleware {
    private static $secret = 'MiSecretoTallerAutomotriz_2026';

    public static function generateToken(array $user): string {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'id' => $user['id_usuario'] ?? $user['id'],
            'role' => $user['rol'] ?? $user['role'],
            'exp' => time() + (60 * 60 * 24) // Expira en 24 horas
        ]);

        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$secret, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public static function checkToken() {
        // En servidores nativos y Apache la cabecera puede llegar de diferentes formas
        $headers = [];
        if (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
        }
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode(["error" => "Acceso denegado. Se requiere un token de autorizacion (Bearer)."]);
            exit;
        }

        $jwt = $matches[1];
        $tokenParts = explode('.', $jwt);
        
        if (count($tokenParts) !== 3) {
            http_response_code(401);
            echo json_encode(["error" => "Token invalido o mal formado."]);
            exit;
        }
        
        $base64UrlHeader = $tokenParts[0];
        $base64UrlPayload = $tokenParts[1];
        $signature_provided = $tokenParts[2];
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$secret, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        if ($base64UrlSignature !== $signature_provided) {
            http_response_code(401);
            echo json_encode(["error" => "El token ha sido corrompido o su firma es invalida."]);
            exit;
        }
        
        $payloadData = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $base64UrlPayload)), true);
        
        if (isset($payloadData['exp']) && $payloadData['exp'] < time()) {
            http_response_code(401);
            echo json_encode(["error" => "El token ha expirado. Por favor, inicie sesion nuevamente."]);
            exit;
        }

        // Si pasa todas las validaciones retorna los datos del payload (e.g., id y role)
        return $payloadData;
    }
}

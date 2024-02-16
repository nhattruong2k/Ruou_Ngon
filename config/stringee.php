<?php

return [
    'api_key_sid' => 'SK.0.BUZpDQWQuz6hU6B4DTIhplOLPESCxIa',
    'api_key_secret' => 'QXVxVjFFNlZsVHZtZW9Eakt2RVZPMW9HYlRNY1o4V2I=',
    'api_url' => 'https://api.stringee.com/v1',
    'number_phone' => '842899988869',
    'header' => [
        "typ" => "JWT",
        "alg" => "HS256",
        "cty" => "stringee-api;v=1"
    ],
    'payload_client_api' =>
    [
        "jti" => env('STRINGEE_API_KEY_SID') . "-" . time(),
        "iss" => env('STRINGEE_API_KEY_SID'),
        "exp" => time() + 3600,
        "userId" => 'user1'
    ],
    'payload_client_rest_api' =>
    [
        "jti" => env('STRINGEE_API_KEY_SID') . "-" . time(),
        "iss" => env('STRINGEE_API_KEY_SID'),
        "exp" => time() + 3600,
        "rest_api" => true
    ]
];

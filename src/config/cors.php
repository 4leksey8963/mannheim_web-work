<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Здесь вы можете настроить параметры для обработки CORS.
    | Подробнее: https://github.com/fruitcake/laravel-cors (или barryvdh/laravel-cors)
    |
    */

    'paths' => ['api/*'], // Применять правила CORS только к маршрутам, начинающимся с 'api/'
                          // Если все ваши API-маршруты имеют префикс 'api', это хорошо.
                          // Если нет, можно указать ['*'] для всех путей, но это менее безопасно.

    'allowed_methods' => ['*'], // Разрешить все HTTP-методы (GET, POST, PUT, DELETE, OPTIONS и т.д.)

    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')], // URL вашего React dev-сервера (Vite)

    'allowed_origins_patterns' => [], // Можно использовать регулярные выражения для origins

    'allowed_headers' => ['*'], // Разрешить все заголовки в запросе (например, Authorization, Content-Type)

    'exposed_headers' => [], // Заголовки, которые клиент сможет прочитать из ответа,
                              // кроме стандартных (Cache-Control, Content-Language, Content-Type, Expires, Last-Modified, Pragma).
                              // Обычно здесь ничего не нужно добавлять для простого API.

    'max_age' => 0, // Как долго результат preflight-запроса (OPTIONS) может кэшироваться браузером (в секундах). 0 - не кэшировать.

    'supports_credentials' => false, // Установите true, если ваше API использует куки или HTTP-аутентификацию
                                     // и вы хотите разрешить передачу credentials (например, куки)
                                     // вместе с кросс-доменными запросами.
                                     // Для JWT-аутентификации через Authorization header обычно false.
];
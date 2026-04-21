<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="UTF-8">
    <title>{{ __('messages.welcome_subject') }}</title>
</head>
<body>
    <h2>{{ __('messages.hello_user', ['name' => $user->name]) }}</h2>
    <p>{{ __('messages.welcome_body') }}</p>
</body>
</html>

<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="UTF-8">
    <title>{{ __('messages.new_contact_subject') }}</title>
</head>
<body>
    <h2>{{ __('messages.new_contact_subject') }}</h2>
    <p><strong>{{ __('messages.name') }}:</strong> {{ $contact->nom }}</p>
    <p><strong>{{ __('messages.email') }}:</strong> {{ $contact->email }}</p>
    <p><strong>{{ __('messages.message') }}:</strong></p>
    <p>{{ $contact->message }}</p>
</body>
</html>

<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ __('messages.welcome_subject') }}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f6fb;font-family:Arial,sans-serif;color:#1f2937;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;background-color:#f3f6fb;padding:24px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;max-width:600px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                    <tr>
                        <td style="padding:18px 24px;background-color:#0f172a;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.3px;">
                            AK Rapid Trans
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:24px;">
                            <p style="margin:0 0 12px;font-size:18px;line-height:1.4;font-weight:700;color:#111827;">
                                Bonjour {{ $user->name }},
                            </p>
                            <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#374151;">
                                Votre compte est activé. Vous pouvez maintenant accéder à votre espace en toute sécurité.
                            </p>
                            <a href="{{ config('app.url') }}" style="display:inline-block;padding:11px 18px;background-color:#0284c7;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;border-radius:8px;">
                                Accéder à la plateforme
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:16px 24px;border-top:1px solid #e5e7eb;font-size:12px;line-height:1.5;color:#6b7280;background-color:#fafafa;">
                            © {{ now()->year }} AK Rapid Trans. Tous droits réservés.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

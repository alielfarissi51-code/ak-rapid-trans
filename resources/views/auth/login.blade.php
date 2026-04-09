<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Connexion - AK RAPID TRANS</title>
    <style>
        :root { color-scheme: light; }
        body { margin: 0; font-family: Arial, sans-serif; background: linear-gradient(135deg, #eef2ff, #f8fafc); color: #111827; }
        .container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .card { width: 100%; max-width: 420px; background: #fff; border-radius: 16px; box-shadow: 0 20px 40px rgba(15, 23, 42, .12); padding: 1.5rem; }
        h1 { margin: 0 0 .25rem; font-size: 1.75rem; }
        p { margin: 0; }
        .muted { color: #6b7280; margin-bottom: 1.25rem; }
        .error { margin-bottom: 1rem; border: 1px solid #fecaca; background: #fef2f2; color: #b91c1c; padding: .75rem; border-radius: 12px; font-size: .95rem; }
        .field { margin-bottom: 1rem; }
        label { display: block; margin-bottom: .4rem; font-size: .92rem; font-weight: 600; }
        input[type="email"], input[type="password"] { width: 100%; box-sizing: border-box; border: 1px solid #d1d5db; border-radius: 12px; padding: .85rem .9rem; font-size: 1rem; outline: none; }
        input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.12); }
        .row { display: flex; align-items: center; gap: .5rem; font-size: .95rem; color: #4b5563; margin-bottom: 1rem; }
        .btn { width: 100%; border: none; border-radius: 12px; padding: .9rem 1rem; background: #4f46e5; color: #fff; font-weight: 700; cursor: pointer; }
        .btn:hover { background: #4338ca; }
        .footer { margin-top: 1rem; text-align: center; font-size: .95rem; color: #4b5563; }
        .footer a { color: #4f46e5; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
        <h1>Connexion</h1>
        <p class="muted">Accédez à votre espace AK RAPID TRANS.</p>

        @if (session('success'))
            <div class="mb-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                {{ session('success') }}
            </div>
        @endif

        @if ($errors->any())
            <div class="error">
                {{ $errors->first() }}
            </div>
        @endif

        <form method="POST" action="{{ route('login.attempt') }}">
            @csrf
            <div class="field">
                <label for="email">Email</label>
                <input id="email" type="email" name="email" value="{{ old('email') }}" required autofocus>
            </div>

            <div class="field">
                <label for="password">Mot de passe</label>
                <input id="password" type="password" name="password" required>
            </div>

            <label class="row">
                <input type="checkbox" name="remember" class="rounded border-gray-300">
                Se souvenir de moi
            </label>

            <button type="submit" class="btn">
                Se connecter
            </button>
        </form>

        <p class="footer">
            Pas de compte ?
            <a href="{{ route('register') }}">Créer un compte</a>
        </p>
        </div>
    </div>
</body>
</html>

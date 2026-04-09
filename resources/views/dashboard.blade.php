<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Dashboard - AK RAPID TRANS</title>
    <style>
        body { margin: 0; font-family: Arial, sans-serif; background: #f3f4f6; color: #111827; }
        .header { background: #fff; border-bottom: 1px solid #e5e7eb; }
        .wrap { max-width: 1120px; margin: 0 auto; padding: 1rem; }
        .topbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
        .title { font-size: 1.25rem; font-weight: 700; margin: 0; }
        .subtitle { margin: .25rem 0 0; font-size: .95rem; color: #6b7280; }
        .logout { border: none; border-radius: 10px; background: #dc2626; color: #fff; padding: .75rem 1rem; cursor: pointer; }
        .logout:hover { background: #b91c1c; }
        main.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; padding: 2rem 0; }
        .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 1.25rem; text-decoration: none; color: inherit; transition: box-shadow .2s ease, transform .2s ease; }
        .card:hover { box-shadow: 0 10px 24px rgba(15,23,42,.08); transform: translateY(-2px); }
        .card h2 { margin: 0; font-size: 1.05rem; }
        .card p { margin: .4rem 0 0; color: #6b7280; font-size: .95rem; }
    </style>
</head>
<body>
    <header class="header">
        <div class="wrap topbar">
            <div>
                <h1 class="title">AK RAPID TRANS</h1>
                <p class="subtitle">Bienvenue {{ auth()->user()->name }}</p>
            </div>
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button type="submit" class="logout">
                    Déconnexion
                </button>
            </form>
        </div>
    </header>

    <main class="wrap grid">
        <a href="{{ route('clients.index') }}" class="card">
            <h2 class="font-semibold">Clients</h2>
            <p>Afficher les clients enregistrés.</p>
        </a>

        <a href="{{ route('contacts.index') }}" class="card">
            <h2 class="font-semibold">Contacts</h2>
            <p>Consulter les messages de contact.</p>
        </a>

        @if (auth()->user()?->role?->name === 'admin')
            <a href="{{ route('commandes.index') }}" class="card">
                <h2 class="font-semibold">Commandes</h2>
                <p>Consulter et gérer les commandes.</p>
            </a>

            <a href="{{ route('camions.index') }}" class="card">
                <h2 class="font-semibold">Camions</h2>
                <p>Gérer la flotte de camions.</p>
            </a>

            <a href="{{ route('roles.index') }}" class="card">
                <h2 class="font-semibold">Rôles</h2>
                <p>Administrer les rôles système.</p>
            </a>
        @endif
    </main>
</body>
</html>

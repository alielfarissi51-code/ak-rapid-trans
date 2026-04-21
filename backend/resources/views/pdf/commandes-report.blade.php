<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="UTF-8">
    <title>{{ __('messages.commandes_report') }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        h1 { margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f3f4f6; }
    </style>
</head>
<body>
    <h1>{{ __('messages.commandes_report') }}</h1>
    <p>{{ __('messages.generated_at') }}: {{ $generatedAt }}</p>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>{{ __('messages.client') }}</th>
                <th>{{ __('messages.truck') }}</th>
                <th>{{ __('messages.departure') }}</th>
                <th>{{ __('messages.arrival') }}</th>
                <th>{{ __('messages.transport_date') }}</th>
                <th>{{ __('messages.status') }}</th>
                <th>{{ __('messages.price') }}</th>
            </tr>
        </thead>
        <tbody>
        @foreach ($commandes as $commande)
            <tr>
                <td>{{ $commande->id }}</td>
                <td>{{ $commande->client?->nom }}</td>
                <td>{{ $commande->camion?->matricule ?? '-' }}</td>
                <td>{{ $commande->lieu_depart }}</td>
                <td>{{ $commande->lieu_arrivee }}</td>
                <td>{{ $commande->date_transport }}</td>
                <td>{{ $commande->statut }}</td>
                <td>{{ $commande->prix }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>
</body>
</html>

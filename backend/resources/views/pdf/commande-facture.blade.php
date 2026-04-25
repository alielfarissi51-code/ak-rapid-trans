<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Facture {{ $factureNumber }}</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            color: #0f172a;
            font-size: 12px;
            margin: 0;
            padding: 24px;
        }
        .header {
            display: table;
            width: 100%;
            margin-bottom: 18px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 12px;
        }
        .header-left, .header-right {
            display: table-cell;
            vertical-align: top;
            width: 50%;
        }
        .header-right {
            text-align: right;
        }
        h1 {
            margin: 0 0 6px;
            font-size: 22px;
        }
        h2 {
            margin: 0 0 8px;
            font-size: 15px;
            color: #334155;
        }
        .muted {
            color: #64748b;
        }
        .meta {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0 18px;
        }
        .meta td {
            padding: 6px 8px;
            border: 1px solid #e2e8f0;
        }
        .meta td.label {
            width: 28%;
            background: #f8fafc;
            font-weight: bold;
        }
        .service-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }
        .service-table th,
        .service-table td {
            border: 1px solid #e2e8f0;
            padding: 8px;
            text-align: left;
        }
        .service-table th {
            background: #f1f5f9;
        }
        .amount {
            text-align: right;
            white-space: nowrap;
        }
        .footer {
            margin-top: 28px;
            border-top: 1px solid #e2e8f0;
            padding-top: 12px;
            font-size: 11px;
            color: #475569;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            <h1>AK Rapid Trans</h1>
            <div class="muted">Service de transport et logistique</div>
            <div class="muted">Email: {{ $commande->client?->email ?: 'contact@akrapidtrans.com' }}</div>
            <div class="muted">Tel: {{ $commande->client?->telephone ?: '-' }}</div>
        </div>
        <div class="header-right">
            <h2>FACTURE</h2>
            <div><strong>N°:</strong> {{ $factureNumber }}</div>
            <div><strong>Date:</strong> {{ $generatedAt->format('d/m/Y H:i') }}</div>
        </div>
    </div>

    <table class="meta">
        <tr>
            <td class="label">Client</td>
            <td>{{ $commande->client?->nom ?: ($commande->user?->name ?: '-') }}</td>
            <td class="label">Commande</td>
            <td>#{{ $commande->id }}</td>
        </tr>
        <tr>
            <td class="label">Email client</td>
            <td>{{ $commande->client?->email ?: ($commande->user?->email ?: '-') }}</td>
            <td class="label">Date transport</td>
            <td>{{ optional($commande->date_transport)->format('d/m/Y') ?: '-' }}</td>
        </tr>
        <tr>
            <td class="label">Telephone client</td>
            <td>{{ $commande->client?->telephone ?: '-' }}</td>
            <td class="label">Trajet</td>
            <td>{{ $commande->lieu_depart }} -> {{ $commande->lieu_arrivee }}</td>
        </tr>
        <tr>
            <td class="label">Camion</td>
            <td>{{ $commande->camion?->matricule ?: 'Non assigne' }}</td>
            <td class="label">Statut</td>
            <td>{{ $commande->statut }} / {{ $commande->verified ? 'Verifiee' : 'Non verifiee' }}</td>
        </tr>
    </table>

    <table class="service-table">
        <thead>
            <tr>
                <th>Description</th>
                <th>Trajet</th>
                <th>Camion</th>
                <th>Date</th>
                <th class="amount">Montant</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Service de transport / Livraison</td>
                <td>{{ $commande->lieu_depart }} -> {{ $commande->lieu_arrivee }}</td>
                <td>{{ $commande->camion?->matricule ?: 'Non assigne' }}</td>
                <td>{{ optional($commande->date_transport)->format('d/m/Y') ?: '-' }}</td>
                <td class="amount">
                    @if(!is_null($commande->prix))
                        DHS {{ number_format((float) $commande->prix, 2, ',', ' ') }}
                    @else
                        Montant a definir
                    @endif
                </td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <div>Merci pour votre confiance.</div>
        <div>AK Rapid Trans - Facture generee automatiquement pour la commande #{{ $commande->id }}.</div>
    </div>
</body>
</html>

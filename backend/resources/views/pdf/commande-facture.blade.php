<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Facture {{ $factureNumber }}</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            color: #111;
            font-size: 12px;
            margin: 0;
            padding: 24px 30px;
        }

        .sheet {
            width: 100%;
        }

        .top-logo {
            text-align: right;
            margin-bottom: 6px;
        }

        .logo-box {
            display: inline-block;
            border: 1px solid #777;
            padding: 5px 10px;
            font-size: 10px;
            font-weight: bold;
            letter-spacing: 0.6px;
        }

        .company-title {
            text-align: center;
            margin-bottom: 10px;
        }

        .company-title h1 {
            margin: 0;
            font-size: 34px;
            font-weight: 700;
            line-height: 1.1;
        }

        .company-title p {
            margin: 4px 0 0;
            font-size: 18px;
            line-height: 1.2;
        }

        .meta {
            width: 100%;
            border-collapse: collapse;
            margin: 6px 0 18px;
        }

        .meta td {
            width: 50%;
            font-size: 13px;
            padding: 2px 0;
        }

        .meta td:last-child {
            text-align: right;
        }

        .client-block {
            margin: 10px 0 16px;
            line-height: 1.8;
            font-size: 13px;
        }

        .invoice-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #111;
        }

        .invoice-table th,
        .invoice-table td {
            border: 1px solid #111;
            padding: 7px 6px;
            font-size: 12px;
            vertical-align: top;
        }

        .invoice-table th {
            text-align: center;
            text-transform: uppercase;
            font-weight: 700;
        }

        .center {
            text-align: center;
            white-space: nowrap;
        }

        .designation {
            text-transform: uppercase;
            text-align: center;
            font-size: 20px;
            line-height: 1.2;
            font-weight: 500;
        }

        .filler-row td {
            height: 270px;
            border-top: 0;
        }

        .bottom-row {
            width: 100%;
            border-collapse: collapse;
            margin-top: 0;
        }

        .bottom-row td {
            vertical-align: top;
        }

        .amount-words {
            width: 67%;
            border-left: 2px solid #111;
            border-bottom: 2px solid #111;
            padding: 10px;
            font-size: 12px;
            line-height: 1.4;
        }

        .totals {
            width: 33%;
            border: 2px solid #111;
            border-top: 0;
        }

        .totals-table {
            width: 100%;
            border-collapse: collapse;
        }

        .totals-table td {
            padding: 5px 8px;
            font-size: 13px;
        }

        .totals-table td:last-child {
            text-align: right;
            white-space: nowrap;
        }

        .ttc-row td {
            border-top: 1px solid #111;
            font-weight: 700;
        }

        .signature {
            font-size: 11px;
            padding: 3px 8px 6px;
        }

        .footer-legal {
            margin-top: 18px;
            background: #e5e5e5;
            text-align: center;
            font-size: 11px;
            line-height: 1.35;
            padding: 6px 8px;
        }
    </style>
</head>
<body>
@php
    $dateTransport = $commande->date_transport ? \Carbon\Carbon::parse($commande->date_transport) : null;
    $clientName = $commande->client?->nom ?: ($commande->user?->name ?: '-');
    $truckNumber = $commande->camion?->matricule ?: 'Non assigne';
    $designation = strtoupper(($commande->lieu_depart ?: '-') . ' - ' . ($commande->lieu_arrivee ?: '-'));

    $ht = (float) ($commande->prix ?? 0);
    $tva = $ht * 0.10;
    $ttc = $ht + $tva;

    $amountWords = number_format($ttc, 2, ',', ' ') . ' dirhams';
    if (class_exists(NumberFormatter::class)) {
        $formatter = new NumberFormatter('fr_FR', NumberFormatter::SPELLOUT);
        $words = $formatter->format((int) round($ttc));
        if (is_string($words) && $words !== '') {
            $amountWords = ucfirst($words) . ' dirhams';
        }
    }
@endphp

<div class="sheet">
    <div class="top-logo">
        <span class="logo-box">AK RAPID TRANS</span>
    </div>

    <div class="company-title">
        <h1>AK RAPID TRANS SARL</h1>
        <p>TRANSPORT DE MARCHANDISES</p>
    </div>

    <table class="meta">
        <tr>
            <td><strong>Date:</strong> {{ $generatedAt->format('d-m-Y') }}</td>
            <td><strong>Facture N°:</strong> {{ $factureNumber }}</td>
        </tr>
    </table>

    <div class="client-block">
        <div><strong>Client:</strong> {{ strtoupper($clientName) }}</div>
        <div><strong>ICE N°:</strong> {{ $commande->client?->id ?: '-' }}</div>
    </div>

    <table class="invoice-table">
        <thead>
            <tr>
                <th style="width:16%;">BL N°</th>
                <th style="width:16%;">DATE BL</th>
                <th style="width:28%;">DESIGNATION</th>
                <th style="width:20%;">CAMION N°</th>
                <th style="width:20%;">Total H.T</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="center">BL {{ $commande->id }}</td>
                <td class="center">{{ $dateTransport?->format('d/m/Y') ?: '-' }}</td>
                <td class="designation">{{ $designation }}</td>
                <td class="center">{{ $truckNumber }}</td>
                <td class="center">{{ number_format($ht, 2, '.', ',') }}</td>
            </tr>
            <tr class="filler-row">
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
        </tbody>
    </table>

    <table class="bottom-row">
        <tr>
            <td class="amount-words">
                arreter la presente Facture a la somme de:<br>
                <strong>{{ $amountWords }}</strong>
            </td>
            <td class="totals">
                <table class="totals-table">
                    <tr>
                        <td>HT</td>
                        <td>{{ number_format($ht, 2, '.', ',') }}</td>
                    </tr>
                    <tr>
                        <td>TVA 10%</td>
                        <td>{{ number_format($tva, 2, '.', ',') }}</td>
                    </tr>
                    <tr class="ttc-row">
                        <td>TTC</td>
                        <td>{{ number_format($ttc, 2, '.', ',') }}</td>
                    </tr>
                </table>
                <div class="signature">signe:</div>
            </td>
        </tr>
    </table>

    <div class="footer-legal">
        AV HASSAN II RES NORA IMM D1 APPT 4 RDC MARTIL &nbsp;&nbsp; RC: 38841<br>
        Patente: 51806955 &nbsp;&nbsp; IF: 68777041 &nbsp;&nbsp; ICE: 003826561000075 &nbsp;&nbsp; CNSS: 6486368
    </div>
</div>
</body>
</html>

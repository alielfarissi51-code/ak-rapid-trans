<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    /**
     * Export commandes list as PDF.
     */
    public function commandesPdf(Request $request)
    {
        $commandes = Commande::with(['client', 'camion'])->latest()->get();

        $pdf = Pdf::loadView('pdf.commandes-report', [
            'commandes' => $commandes,
            'generatedAt' => now(),
        ]);

        return $pdf->download('commandes-report-' . now()->format('Ymd-His') . '.pdf');
    }

    /**
     * Summary based on stored procedure.
     */
    public function commandesSummary()
    {
        try {
            $driver = DB::connection()->getDriverName();

            $summary = $driver === 'pgsql'
                ? DB::select('SELECT * FROM sp_commandes_status_summary()')
                : DB::select('CALL sp_commandes_status_summary()');
        } catch (\Throwable) {
            $summary = Commande::query()
                ->selectRaw('statut, COUNT(*) AS total, COALESCE(SUM(prix), 0) AS total_amount')
                ->groupBy('statut')
                ->orderByDesc('total')
                ->get();
        }

        return response()->json([
            'data' => $summary,
        ]);
    }

    /**
     * Export commandes to XML.
     */
    public function exportCommandesXml()
    {
        $commandes = Commande::with(['client', 'camion'])->latest()->get();

        $xml = new \SimpleXMLElement('<commandes/>');

        foreach ($commandes as $commande) {
            $commandeNode = $xml->addChild('commande');
            $commandeNode->addChild('id', (string) $commande->id);
            $commandeNode->addChild('client_id', (string) $commande->client_id);
            $commandeNode->addChild('camion_id', (string) ($commande->camion_id ?? ''));
            $commandeNode->addChild('lieu_depart', htmlspecialchars((string) $commande->lieu_depart));
            $commandeNode->addChild('lieu_arrivee', htmlspecialchars((string) $commande->lieu_arrivee));
            $commandeNode->addChild('date_transport', (string) $commande->date_transport);
            $commandeNode->addChild('prix', (string) ($commande->prix ?? ''));
            $commandeNode->addChild('statut', (string) $commande->statut);
        }

        return response($xml->asXML(), 200)
            ->header('Content-Type', 'application/xml')
            ->header('Content-Disposition', 'attachment; filename="commandes-export.xml"');
    }

    /**
     * Import commandes from XML file.
     */
    public function importCommandesXml(Request $request)
    {
        $validated = $request->validate([
            'xml_file' => ['required', 'file', 'mimes:xml,txt'],
        ]);

        $content = file_get_contents($validated['xml_file']->getRealPath());

        if ($content === false) {
            return response()->json([
                'message' => __('messages.xml_read_error'),
            ], 422);
        }

        $xml = simplexml_load_string($content);

        if ($xml === false) {
            return response()->json([
                'message' => __('messages.xml_invalid_format'),
            ], 422);
        }

        $created = 0;

        DB::transaction(function () use ($xml, &$created): void {
            foreach ($xml->commande as $item) {
                $payload = [
                    'client_id' => (int) $item->client_id,
                    'camion_id' => Str::of((string) $item->camion_id)->trim()->isEmpty() ? null : (int) $item->camion_id,
                    'lieu_depart' => (string) $item->lieu_depart,
                    'lieu_arrivee' => (string) $item->lieu_arrivee,
                    'date_transport' => (string) $item->date_transport,
                    'prix' => Str::of((string) $item->prix)->trim()->isEmpty() ? null : (float) $item->prix,
                    'statut' => (string) $item->statut,
                ];

                Commande::create($payload);
                $created++;
            }
        });

        return response()->json([
            'message' => __('messages.xml_import_success'),
            'created' => $created,
        ]);
    }

}

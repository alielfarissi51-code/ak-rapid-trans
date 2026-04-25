<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class CommandeController extends Controller
{
    private function factureInfo(Commande $commande): array
    {
        return [
            'commande_id' => $commande->id,
            'facture_number' => $commande->facture_number,
            'facture_generated_at' => optional($commande->facture_generated_at)->toIso8601String(),
            'download_url' => url("/api/commandes/{$commande->id}/facture/download"),
        ];
    }

    private function nextFactureNumber(): string
    {
        $year = now()->format('Y');
        $prefix = "FAC-{$year}-";

        $lastNumber = Commande::query()
            ->whereNotNull('facture_number')
            ->where('facture_number', 'like', $prefix.'%')
            ->orderByDesc('facture_number')
            ->lockForUpdate()
            ->value('facture_number');

        $nextSequence = 1;

        if ($lastNumber && Str::startsWith($lastNumber, $prefix)) {
            $tail = (int) Str::after($lastNumber, $prefix);
            if ($tail > 0) {
                $nextSequence = $tail + 1;
            }
        }

        return $prefix.str_pad((string) $nextSequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(
            Commande::with(['user', 'client', 'camion'])->latest()->get()
        );
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return response()->json(['message' => 'Utiliser POST /commandes pour créer une commande.']);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['nullable', 'exists:users,id'],
            'client_id' => ['required', 'exists:clients,id'],
            'camion_id' => ['nullable', 'exists:camions,id'],
            'lieu_depart' => ['required', 'string', 'max:255'],
            'lieu_arrivee' => ['required', 'string', 'max:255'],
            'date_transport' => ['required', 'date'],
            'prix' => ['nullable', 'numeric', 'min:0'],
            'statut' => ['nullable', Rule::in(['en_attente', 'validee', 'en_cours', 'livree', 'annulee'])],
            'verified' => ['nullable', 'boolean'],
        ]);

        $commande = DB::transaction(function () use ($validated) {
            return Commande::create($validated);
        });

        return response()->json($commande->load(['user', 'client', 'camion']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Commande $commande)
    {
        return response()->json($commande->load(['user', 'client', 'camion']));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Commande $commande)
    {
        return response()->json([
            'message' => 'Utiliser PUT/PATCH /commandes/{commande} pour modifier cette commande.',
            'data' => $commande->load(['client', 'camion']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Commande $commande)
    {
        $validated = $request->validate([
            'user_id' => ['sometimes', 'nullable', 'exists:users,id'],
            'client_id' => ['sometimes', 'required', 'exists:clients,id'],
            'camion_id' => ['nullable', 'exists:camions,id'],
            'lieu_depart' => ['sometimes', 'required', 'string', 'max:255'],
            'lieu_arrivee' => ['sometimes', 'required', 'string', 'max:255'],
            'date_transport' => ['sometimes', 'required', 'date'],
            'prix' => ['nullable', 'numeric', 'min:0'],
            'statut' => ['sometimes', 'required', Rule::in(['en_attente', 'validee', 'en_cours', 'livree', 'annulee'])],
            'verified' => ['sometimes', 'boolean'],
        ]);

        DB::transaction(function () use ($commande, $validated) {
            $commande->update($validated);
        });

        return response()->json($commande->load(['user', 'client', 'camion']));
    }

    /**
     * Display trigger-based status history for the specified commande.
     */
    public function statusLogs(Commande $commande)
    {
        $logs = DB::table('commande_status_logs')
            ->where('commande_id', $commande->id)
            ->orderByDesc('changed_at')
            ->get();

        return response()->json([
            'commande_id' => $commande->id,
            'data' => $logs,
        ]);
    }

    public function generateFacture(Request $request, Commande $commande)
    {
        $result = DB::transaction(function () use ($commande): array {
            $lockedCommande = Commande::with(['client', 'camion', 'user'])
                ->lockForUpdate()
                ->findOrFail($commande->id);

            if ($lockedCommande->facture_number && $lockedCommande->facture_path) {
                return [
                    'created' => false,
                    'commande' => $lockedCommande,
                ];
            }

            if ($lockedCommande->statut !== 'validee') {
                return [
                    'created' => null,
                    'commande' => $lockedCommande,
                ];
            }

            $factureNumber = $this->nextFactureNumber();
            $generatedAt = now();

            $pdf = Pdf::loadView('pdf.commande-facture', [
                'commande' => $lockedCommande,
                'factureNumber' => $factureNumber,
                'generatedAt' => $generatedAt,
            ]);

            $safeNumber = Str::of($factureNumber)->replace(['/', '\\', ' '], '-');
            $path = 'factures/'.$safeNumber.'-'.Str::random(12).'.pdf';

            Storage::disk('public')->put($path, $pdf->output());

            $lockedCommande->update([
                'facture_number' => $factureNumber,
                'facture_path' => $path,
                'facture_generated_at' => $generatedAt,
            ]);

            return [
                'created' => true,
                'commande' => $lockedCommande,
            ];
        });

        if ($result['created'] === null) {
            return response()->json([
                'message' => 'Facture can only be generated for validated commandes.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return response()->json([
            'message' => $result['created'] ? 'Facture generated successfully.' : 'Facture already exists.',
            'created' => $result['created'],
            'facture' => $this->factureInfo($result['commande']),
        ]);
    }

    public function downloadFacture(Request $request, Commande $commande)
    {
        $user = $request->user();
        $role = $user?->resolvedRole() ?? '';

        if ($role !== 'admin' && (int) $commande->user_id !== (int) $user?->id) {
            abort(Response::HTTP_FORBIDDEN, 'Access denied.');
        }

        if (! $commande->facture_path || ! Storage::disk('public')->exists($commande->facture_path)) {
            abort(Response::HTTP_NOT_FOUND, 'Facture not found.');
        }

        $filename = ($commande->facture_number ?: 'facture-'.$commande->id).'.pdf';

        return Storage::disk('public')->download($commande->facture_path, $filename, [
            'Content-Type' => 'application/pdf',
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Commande $commande)
    {
        DB::transaction(function () use ($commande) {
            $commande->delete();
        });

        return response()->noContent();
    }
}

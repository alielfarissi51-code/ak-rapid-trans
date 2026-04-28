<?php

namespace App\Http\Controllers;

use App\Models\ClientNotification;
use App\Models\Commande;
use App\Services\TruckAssignmentService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class CommandeController extends Controller
{
    public function __construct(private readonly TruckAssignmentService $trucks) {}

    private function statusNotificationPayload(string $status): array
    {
        $map = [
            'validee' => [
                'title' => 'Commande validee',
                'message' => 'Votre commande a ete validee.',
            ],
            'annulee' => [
                'title' => 'Commande refusee',
                'message' => 'Votre commande a ete refusee.',
            ],
            'livree' => [
                'title' => 'Commande terminee',
                'message' => 'Votre commande est terminee.',
            ],
            'en_cours' => [
                'title' => 'Commande en cours',
                'message' => 'Votre commande est en cours de traitement.',
            ],
            'en_attente' => [
                'title' => 'Commande en attente',
                'message' => 'Votre commande est en attente de validation.',
            ],
        ];

        return $map[$status] ?? [
            'title' => 'Mise a jour de commande',
            'message' => 'Le statut de votre commande a ete mis a jour.',
        ];
    }

    private function isFactureOutdated(Commande $commande): bool
    {
        if (! $commande->facture_exists || ! $commande->facture_generated_at || ! $commande->updated_at) {
            return false;
        }

        return $commande->updated_at->gt($commande->facture_generated_at);
    }

    private function factureInfo(Commande $commande): array
    {
        return [
            'commande_id' => $commande->id,
            'facture_exists' => (bool) $commande->facture_exists,
            'facture_outdated' => $this->isFactureOutdated($commande),
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

    private function generateFactureRecord(Commande $commande, bool $shouldRegenerate = false): array
    {
        $lockedCommande = Commande::with(['client', 'camion', 'user'])
            ->lockForUpdate()
            ->findOrFail($commande->id);

        $hasExistingFacture = (bool) $lockedCommande->facture_exists;
        $isOutdated = $this->isFactureOutdated($lockedCommande);

        if ($hasExistingFacture && ! $shouldRegenerate && ! $isOutdated) {
            return [
                'created' => false,
                'regenerated' => false,
                'needs_regeneration' => false,
                'commande' => $lockedCommande,
            ];
        }

        if ($hasExistingFacture && $isOutdated && ! $shouldRegenerate) {
            return [
                'created' => false,
                'regenerated' => false,
                'needs_regeneration' => true,
                'commande' => $lockedCommande,
            ];
        }

        if (! in_array($lockedCommande->statut, ['validee', 'livree'], true)) {
            return [
                'created' => null,
                'regenerated' => null,
                'needs_regeneration' => false,
                'commande' => $lockedCommande,
            ];
        }

        $factureNumber = $lockedCommande->facture_number ?: $this->nextFactureNumber();
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

        $lockedCommande->refresh();

        return [
            'created' => ! $hasExistingFacture,
            'regenerated' => $hasExistingFacture,
            'needs_regeneration' => false,
            'commande' => $lockedCommande,
        ];
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
            $oldStatus = $commande->statut;

            $commande->update($validated);

            $fresh      = $commande->fresh();
            $newStatus  = (string) $fresh->statut;
            $statusChanged = $newStatus !== $oldStatus;

            if ($statusChanged) {
                // Notify the client about the status change.
                if ($commande->user_id) {
                    $payload = $this->statusNotificationPayload($newStatus);

                    ClientNotification::create([
                        'user_id'     => (int) $commande->user_id,
                        'commande_id' => $commande->id,
                        'title'       => $payload['title'],
                        'message'     => $payload['message'],
                        'is_read'     => false,
                    ]);
                }

                // Free the assigned truck when the order is completed or cancelled.
                if (in_array($newStatus, ['livree', 'annulee'], true)) {
                    $this->trucks->release($fresh);
                }

                if ($newStatus === 'livree') {
                    $this->generateFactureRecord($fresh, true);
                }
            }
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
        $shouldRegenerate = $request->boolean('regenerate');

        $result = DB::transaction(function () use ($commande, $shouldRegenerate): array {
            return $this->generateFactureRecord($commande, $shouldRegenerate);
        });

        if ($result['created'] === null) {
            return response()->json([
                'message' => 'Facture can only be generated or regenerated for validated or delivered commandes.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $message = 'Facture already exists.';
        if ($result['created']) {
            $message = 'Facture generated successfully.';
        } elseif ($result['regenerated']) {
            $message = 'Facture regenerated successfully.';
        } elseif ($result['needs_regeneration']) {
            $message = 'Facture is outdated and requires regeneration.';
        }

        return response()->json([
            'message' => $message,
            'created' => $result['created'],
            'regenerated' => (bool) $result['regenerated'],
            'needs_regeneration' => (bool) $result['needs_regeneration'],
            'facture' => $this->factureInfo($result['commande']),
        ]);
    }

    public function downloadFacture(Request $request, Commande $commande)
    {
        $user = $request->user();
        $role = $user?->resolvedRole() ?? '';

        $commande->refresh();

        if ($role !== 'admin' && (int) $commande->user_id !== (int) $user?->id) {
            abort(Response::HTTP_FORBIDDEN, 'Access denied.');
        }

        if (! $commande->facture_exists || ! Storage::disk('public')->exists($commande->facture_path)) {
            abort(Response::HTTP_NOT_FOUND, 'Facture not found.');
        }

        if ($role !== 'admin' && $this->isFactureOutdated($commande)) {
            abort(Response::HTTP_CONFLICT, 'Facture is outdated and currently being updated.');
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

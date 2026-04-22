<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Commande;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClientOrderController extends Controller
{
    public function summary(Request $request)
    {
        $userId = (int) $request->user()->id;

        try {
            $summary = DB::select('CALL sp_client_commandes_status_summary(?)', [$userId]);
        } catch (\Throwable $exception) {
            // Safe fallback if the procedure is not yet deployed.
            $summary = Commande::query()
                ->selectRaw('statut, COUNT(*) AS total, COALESCE(SUM(prix), 0) AS total_amount')
                ->where('user_id', $userId)
                ->groupBy('statut')
                ->orderByDesc('total')
                ->get();
        }

        return response()->json([
            'data' => $summary,
        ]);
    }

    public function index(Request $request)
    {
        $orders = Commande::with(['client', 'camion'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'lieu_depart' => ['required', 'string', 'max:255'],
            'lieu_arrivee' => ['required', 'string', 'max:255'],
            'date_transport' => ['required', 'date'],
            'prix' => ['nullable', 'numeric', 'min:0'],
        ]);

        $user = $request->user();

        $client = Client::query()->firstOrCreate(
            ['email' => $user->email],
            [
                'nom' => $user->name,
                'telephone' => '-',
                'adresse' => null,
            ]
        );

        $commande = DB::transaction(function () use ($validated, $client, $user) {
            return Commande::create([
                'user_id' => $user->id,
                'client_id' => $client->id,
                'camion_id' => null,
                'lieu_depart' => $validated['lieu_depart'],
                'lieu_arrivee' => $validated['lieu_arrivee'],
                'date_transport' => $validated['date_transport'],
                'prix' => $validated['prix'] ?? null,
                'statut' => 'en_attente',
                'verified' => false,
            ]);
        });

        return response()->json($commande->load(['client', 'camion']), 201);
    }

    public function show(Request $request, Commande $commande)
    {
        if ((int) $commande->user_id !== (int) $request->user()->id) {
            abort(403, 'Access denied.');
        }

        return response()->json($commande->load(['client', 'camion']));
    }
}

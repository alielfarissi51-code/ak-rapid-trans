<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CommandeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(
            Commande::with(['client', 'camion'])->latest()->get()
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
            'client_id' => ['required', 'exists:clients,id'],
            'camion_id' => ['nullable', 'exists:camions,id'],
            'lieu_depart' => ['required', 'string', 'max:255'],
            'lieu_arrivee' => ['required', 'string', 'max:255'],
            'date_transport' => ['required', 'date'],
            'prix' => ['nullable', 'numeric', 'min:0'],
            'statut' => ['nullable', Rule::in(['en_attente', 'validee', 'en_cours', 'livree', 'annulee'])],
        ]);

        $commande = DB::transaction(function () use ($validated) {
            return Commande::create($validated);
        });

        return response()->json($commande->load(['client', 'camion']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Commande $commande)
    {
        return response()->json($commande->load(['client', 'camion']));
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
            'client_id' => ['sometimes', 'required', 'exists:clients,id'],
            'camion_id' => ['nullable', 'exists:camions,id'],
            'lieu_depart' => ['sometimes', 'required', 'string', 'max:255'],
            'lieu_arrivee' => ['sometimes', 'required', 'string', 'max:255'],
            'date_transport' => ['sometimes', 'required', 'date'],
            'prix' => ['nullable', 'numeric', 'min:0'],
            'statut' => ['sometimes', 'required', Rule::in(['en_attente', 'validee', 'en_cours', 'livree', 'annulee'])],
        ]);

        DB::transaction(function () use ($commande, $validated) {
            $commande->update($validated);
        });

        return response()->json($commande->load(['client', 'camion']));
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

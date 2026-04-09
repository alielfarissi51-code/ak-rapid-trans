<?php

namespace App\Http\Controllers;

use App\Models\Camion;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CamionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Camion::latest()->get());
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return response()->json(['message' => 'Utiliser POST /camions pour créer un camion.']);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'matricule' => ['required', 'string', 'max:50', 'unique:camions,matricule'],
            'marque' => ['required', 'string', 'max:255'],
            'capacite' => ['required', 'integer', 'min:1'],
            'statut' => ['nullable', Rule::in(['disponible', 'en_maintenance', 'indisponible'])],
        ]);

        $camion = Camion::create($validated);

        return response()->json($camion, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Camion $camion)
    {
        return response()->json($camion);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Camion $camion)
    {
        return response()->json([
            'message' => 'Utiliser PUT/PATCH /camions/{camion} pour modifier ce camion.',
            'data' => $camion,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Camion $camion)
    {
        $validated = $request->validate([
            'matricule' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('camions', 'matricule')->ignore($camion->id)],
            'marque' => ['sometimes', 'required', 'string', 'max:255'],
            'capacite' => ['sometimes', 'required', 'integer', 'min:1'],
            'statut' => ['sometimes', 'required', Rule::in(['disponible', 'en_maintenance', 'indisponible'])],
        ]);

        $camion->update($validated);

        return response()->json($camion);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Camion $camion)
    {
        $camion->delete();

        return response()->noContent();
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Camion;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CamionController extends Controller
{
    public function index()
    {
        return response()->json(Camion::latest()->get());
    }

    public function create()
    {
        return response()->json(['message' => 'Utiliser POST /camions pour créer un camion.']);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'matricule'    => ['required', 'string', 'max:50', 'unique:camions,matricule'],
            'marque'       => ['required', 'string', 'max:255'],
            'capacite'     => ['required', 'integer', 'min:1'],
            'localisation' => ['nullable', 'string', 'max:255'],
            'statut'       => ['nullable', Rule::in(Camion::STATUSES)],
        ]);

        return response()->json(Camion::create($validated), 201);
    }

    public function show(Camion $camion)
    {
        return response()->json($camion);
    }

    public function edit(Camion $camion)
    {
        return response()->json([
            'message' => 'Utiliser PUT/PATCH /camions/{camion} pour modifier ce camion.',
            'data'    => $camion,
        ]);
    }

    public function update(Request $request, Camion $camion)
    {
        $validated = $request->validate([
            'matricule'    => ['sometimes', 'required', 'string', 'max:50', Rule::unique('camions', 'matricule')->ignore($camion->id)],
            'marque'       => ['sometimes', 'required', 'string', 'max:255'],
            'capacite'     => ['sometimes', 'required', 'integer', 'min:1'],
            'localisation' => ['sometimes', 'nullable', 'string', 'max:255'],
            'statut'       => ['sometimes', 'required', Rule::in(Camion::STATUSES)],
        ]);

        $camion->update($validated);

        return response()->json($camion);
    }

    public function destroy(Camion $camion)
    {
        $camion->delete();

        return response()->noContent();
    }
}

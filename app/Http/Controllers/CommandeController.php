<?php

namespace App\Http\Controllers;
use App\Models\Camion;
use App\Models\Client;
use App\Models\Commande;
use Illuminate\Http\Request;

class CommandeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $commandes = Commande::with(['client', 'camion'])->get();
        return view('commandes.index', compact('commandes'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $clients = Client::all();
        $camions = Camion::all();
        return view('commandes.create', compact('clients', 'camions'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'lieu_depart' => 'required|string|max:255',
            'lieu_arrivee' => 'required|string|max:255',
            'date_transport' => 'required|date',
        ]);

        Commande::create($request->all());

        return redirect()->route('commandes.index');
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $commande=Commande::findOrFail($id);
        return view('commandes.show', compact('commande'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Commande $commande)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Commande $commande)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)

    {
        Commande::destroy($id);
        return back();
    }
}

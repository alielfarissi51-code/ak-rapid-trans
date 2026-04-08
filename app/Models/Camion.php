<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Camion extends Model
{
    protected $fillable = ['matricule', 'marque', 'capacite', 'statut'];

    public function commandes()
    {
        return $this->hasMany(Commande::class);
    }
}

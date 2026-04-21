<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Camion extends Model
{
    use HasFactory;

    protected $fillable = ['matricule', 'marque', 'capacite', 'statut'];

    public function commandes()
    {
        return $this->hasMany(Commande::class);
    }
}

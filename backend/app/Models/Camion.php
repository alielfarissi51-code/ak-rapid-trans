<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Camion extends Model
{
    use HasFactory;

    /** All valid statut values. */
    public const STATUSES = ['disponible', 'occupe', 'en_maintenance', 'indisponible'];

    protected $fillable = ['matricule', 'marque', 'capacite', 'localisation', 'statut'];

    public function commandes()
    {
        return $this->hasMany(Commande::class);
    }
}

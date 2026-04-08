<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Commande extends Model
{
    protected $fillable = [
        'client_id',
        'camion_id',
        'lieu_depart',
        'lieu_arrivee',
        'date_transport',
        'prix',
        'statut'
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function camion()
    {
        return $this->belongsTo(Camion::class);
    }
}

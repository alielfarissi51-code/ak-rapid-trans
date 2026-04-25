<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commande extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'client_id',
        'camion_id',
        'lieu_depart',
        'lieu_arrivee',
        'date_transport',
        'prix',
        'statut',
        'verified',
        'facture_number',
        'facture_path',
        'facture_generated_at',
    ];

    protected $casts = [
        'date_transport' => 'date',
        'prix' => 'decimal:2',
        'verified' => 'boolean',
        'facture_generated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function camion()
    {
        return $this->belongsTo(Camion::class);
    }
}

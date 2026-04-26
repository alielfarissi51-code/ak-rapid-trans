<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commande extends Model
{
    use HasFactory;

    protected $appends = [
        'facture_exists',
        'facture_outdated',
    ];

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

    public function getFactureExistsAttribute(): bool
    {
        return ! empty($this->facture_number) && ! empty($this->facture_path);
    }

    public function getFactureOutdatedAttribute(): bool
    {
        if (! $this->facture_exists || ! $this->facture_generated_at || ! $this->updated_at) {
            return false;
        }

        return $this->updated_at->gt($this->facture_generated_at);
    }
}

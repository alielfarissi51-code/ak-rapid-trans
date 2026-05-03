<?php

use App\Providers\AppServiceProvider;
use Barryvdh\DomPDF\ServiceProvider as DomPdfServiceProvider;

return [
    DomPdfServiceProvider::class,
    AppServiceProvider::class,
];

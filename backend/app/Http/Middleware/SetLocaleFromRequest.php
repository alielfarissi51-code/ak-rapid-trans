<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocaleFromRequest
{
    /**
     * Set app locale from query/header/cookie.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $requestedLocale = $request->query('lang')
            ?? $request->header('X-Locale')
            ?? $request->getPreferredLanguage(['fr', 'en'])
            ?? config('app.locale');

        $locale = in_array($requestedLocale, ['fr', 'en'], true) ? $requestedLocale : config('app.locale');

        app()->setLocale($locale);

        return $next($request);
    }
}

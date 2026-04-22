<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        $normalizedRoles = array_map(static fn (string $role): string => strtolower($role), $roles);
        $userRole = $user?->resolvedRole() ?? '';

        if (! $user || ! in_array($userRole, $normalizedRoles, true)) {
            abort(403, 'Accès refusé.');
        }

        return $next($request);
    }
}

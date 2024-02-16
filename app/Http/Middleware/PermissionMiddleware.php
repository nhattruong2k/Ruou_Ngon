<?php

namespace App\Http\Middleware;

use Closure;
use App\Traits\ResponseTrait;
use Spatie\Permission\Exceptions\UnauthorizedException;

class PermissionMiddleware
{
    use ResponseTrait;
    public function handle($request, Closure $next, $permission, $guard = null)
    {
        $authGuard = app('auth')->guard($guard);

        if ($authGuard->guest()) {
            throw UnauthorizedException::notLoggedIn();
        }

        $permissions = is_array($permission)
            ? $permission
            : explode('|', $permission);

        foreach ($permissions as $permission) {
            if ($authGuard->user()->can($permission)) {
                return $next($request);
            }
        }

        return $this->responseError(false, null, 'User does not have the right permissions.', 403);
    }
}

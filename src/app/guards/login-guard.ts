import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map, filter, switchMap, take } from 'rxjs/operators';

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthCheckFinished$.pipe(
    filter(isFinished => isFinished === true),
    take(1),
    switchMap(() => authService.isAuthenticated),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return router.createUrlTree(['/users']); 
      } else {
        return true; 
      }
    })
  );
};
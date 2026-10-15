import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const role = this.auth.getRole();
    if (!role) {
      this.router.navigate(['/login']);
      return false;
    }

    const allowed: string[] | undefined = route.data?.['roles'];
    if (allowed && !allowed.includes(role)) {
      // Role not allowed for this route. Redirect to access-denied page.
      this.router.navigate(['/access-denied']);
      return false;
    }

    return true;
  }
}

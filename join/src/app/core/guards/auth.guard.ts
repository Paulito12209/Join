import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, tap } from 'rxjs/operators';

/**
 * Authentication Guard
 * 
 * A route guard that protects routes from unauthorized access.
 * Checks if a user is authenticated before allowing navigation to a route.
 * 
 * **Behavior:**
 * - If the user is authenticated (logged in), allows navigation to the requested route
 * - If the user is not authenticated, redirects to the login page ('/login')
 * - Uses the AuthService to check the current authentication state
 * - Takes only the first emission from the user$ observable to avoid multiple checks
 * 
 * **Usage:**
 * Apply this guard to routes in the routing configuration:
 * ```typescript
 * {
 *   path: 'protected-route',
 *   component: ProtectedComponent,
 *   canActivate: [authGuard]
 * }
 * ```
 * 
 * @param route - The activated route snapshot containing route information
 * @param state - The router state snapshot containing the current router state
 * @returns An Observable<boolean> that emits true if navigation is allowed, false otherwise
 * 
 * @example
 * // In app.routes.ts
 * export const routes: Routes = [
 *   { path: 'summary', component: SummaryComponent, canActivate: [authGuard] },
 *   { path: 'contacts', component: ContactsComponent, canActivate: [authGuard] }
 * ];
 */
export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.user$.pipe(
        take(1), // Take only the first emission to complete the observable
        map(user => !!user), // Convert user object to boolean (true if user exists)
        tap(loggedIn => {
            // If not logged in, redirect to login page
            if (!loggedIn) {
                router.navigate(['/login']);
            }
        })
    );
};

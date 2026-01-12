import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, User, updateProfile } from '@angular/fire/auth';
import { Observable, from, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { ContactsService } from './contacts.service';

/**
 * Authentication Service
 * 
 * Manages user authentication for the application using Firebase Authentication.
 * Supports three authentication methods:
 * - Email/password registration (creates user and adds to contacts)
 * - Email/password sign-in
 * - Guest login (simulated anonymous access for demo purposes)
 * 
 * The service maintains a combined user state that includes both Firebase-authenticated
 * users and simulated guest users, allowing the application to handle both scenarios uniformly.
 * 
 * @injectable
 */
@Injectable({
    providedIn: 'root'
})
export class AuthService {
    /** Firebase Authentication instance */
    private auth: Auth = inject(Auth);
    /** Contacts service for adding new users to contacts list */
    private contactsService = inject(ContactsService);
    /** BehaviorSubject to manage guest user state */
    private guestUserSubject = new BehaviorSubject<User | null>(null);

    /**
     * Observable stream of the current authenticated user.
     * Emits the Firebase user if authenticated, or the guest user if in guest mode.
     * Emits null if no user is logged in.
     * 
     * This combines both Firebase authentication state and guest user state,
     * prioritizing Firebase users over guest users.
     */
    user$: Observable<User | null> = combineLatest([
        user(this.auth),
        this.guestUserSubject.asObservable()
    ]).pipe(
        map(([firebaseUser, guestUser]) => firebaseUser || guestUser)
    );

    constructor() { }

    /**
     * Registers a new user with email and password.
     * 
     * This method performs three operations in sequence:
     * 1. Creates a new Firebase user account
     * 2. Updates the user's display name in their Firebase profile
     * 3. Adds the user to the contacts collection
     * 
     * @param email - User's email address
     * @param password - User's password (must meet Firebase requirements)
     * @param name - User's display name
     * @returns Observable that completes when registration is successful
     * @throws Firebase authentication errors if registration fails
     * 
     * @example
     * authService.signUp('user@example.com', 'SecurePass123', 'John Doe')
     *   .subscribe({
     *     next: () => console.log('Registration successful'),
     *     error: (err) => console.error('Registration failed', err)
     *   });
     */
    signUp(email: string, password: string, name: string): Observable<void> {
        return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
            switchMap(userCredential => from(updateProfile(userCredential.user, { displayName: name }))),
            switchMap(() => from(this.contactsService.createContact({
                name: name,
                email: email
            }))),
            map(() => void 0)
        );
    }

    /**
     * Signs in an existing user with email and password.
     * 
     * @param email - User's email address
     * @param password - User's password
     * @returns Observable that emits the UserCredential on successful login
     * @throws Firebase authentication errors if credentials are invalid
     * 
     * @example
     * authService.signIn('user@example.com', 'password123')
     *   .subscribe({
     *     next: (credential) => console.log('Login successful', credential),
     *     error: (err) => console.error('Login failed', err)
     *   });
     */
    signIn(email: string, password: string): Observable<any> {
        return from(signInWithEmailAndPassword(this.auth, email, password));
    }

    /**
     * Logs in as a guest user (simulated for demo purposes).
     * 
     * Creates a mock Firebase User object with guest credentials that doesn't
     * require actual Firebase authentication. This allows users to explore the
     * application without creating an account.
     * 
     * The guest user has:
     * - UID: 'guest-user'
     * - Display name: 'Guest'
     * - No email
     * - Anonymous flag set to true
     * - Mock token with 1-hour expiration
     * 
     * @returns Observable that completes immediately after setting guest state
     * 
     * @example
     * authService.loginAsGuest().subscribe(() => {
     *   console.log('Logged in as guest');
     *   router.navigate(['/summary']);
     * });
     */
    loginAsGuest(): Observable<void> {
        // Create a fake user object for guest
        const guestUser = {
            uid: 'guest-user',
            displayName: 'Guest',
            email: null,
            isAnonymous: true,
            emailVerified: false,
            phoneNumber: null,
            photoURL: null,
            providerId: 'guest',
            metadata: {},
            providerData: [],
            refreshToken: '',
            tenantId: null,
            delete: () => Promise.resolve(),
            getIdToken: () => Promise.resolve('guest-token'),
            getIdTokenResult: () => Promise.resolve({
                token: 'guest-token',
                signInProvider: 'guest',
                claims: {},
                authTime: Date.now().toString(),
                issuedAtTime: Date.now().toString(),
                expirationTime: (Date.now() + 3600000).toString()
            }),
            reload: () => Promise.resolve(),
            toJSON: () => ({})
        } as unknown as User;

        this.guestUserSubject.next(guestUser);
        return of(void 0);
    }

    /**
     * Signs out the current user (Firebase or guest).
     * 
     * Clears both the guest user state and signs out from Firebase authentication.
     * After sign-out, the user$ observable will emit null.
     * 
     * @returns Observable that completes when sign-out is successful
     * 
     * @example
     * authService.signOut().subscribe(() => {
     *   console.log('Signed out successfully');
     *   router.navigate(['/login']);
     * });
     */
    signOut(): Observable<void> {
        this.guestUserSubject.next(null);
        return from(signOut(this.auth));
    }
}

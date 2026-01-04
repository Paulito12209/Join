import { Injectable, inject } from '@angular/core';
import {
    Auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    user,
    User,
    updateProfile
} from '@angular/fire/auth';
import { Observable, from, BehaviorSubject, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth: Auth = inject(Auth);
    private guestUserSubject = new BehaviorSubject<User | null>(null);

    // Observable for current user state (Firebase User OR Guest User)
    user$: Observable<User | null> = merge(
        user(this.auth),
        this.guestUserSubject.asObservable()
    );

    constructor() { }

    // Sign up with email and password
    signUp(email: string, password: string, name: string): Observable<void> {
        const promise = createUserWithEmailAndPassword(this.auth, email, password)
            .then(userCredential => {
                return updateProfile(userCredential.user, { displayName: name });
            });
        return from(promise);
    }

    // Sign in with email and password
    signIn(email: string, password: string): Observable<any> {
        return from(signInWithEmailAndPassword(this.auth, email, password));
    }

    // Sign in anonymously (Guest login - Simulated for Demo)
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

    // Sign out
    signOut(): Observable<void> {
        this.guestUserSubject.next(null);
        return from(signOut(this.auth));
    }
}

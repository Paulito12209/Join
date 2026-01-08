import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, User, updateProfile } from '@angular/fire/auth';
import { Observable, from, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { ContactsService } from './contacts.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth: Auth = inject(Auth);
    private contactsService = inject(ContactsService);
    private guestUserSubject = new BehaviorSubject<User | null>(null);

    // Observable for current user state (Firebase User OR Guest User)
    user$: Observable<User | null> = combineLatest([
        user(this.auth),
        this.guestUserSubject.asObservable()
    ]).pipe(
        map(([firebaseUser, guestUser]) => firebaseUser || guestUser)
    );

    constructor() { }

    // Sign up with email and password
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

import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes), provideFirebaseApp(() => initializeApp({ projectId: "join-e9b30", appId: "1:600355908800:web:7d13b83805563671d95125", storageBucket: "join-e9b30.firebasestorage.app", apiKey: "AIzaSyCaCIW59UqKhqqGE7zrxJmohgA0nkq1C6s", authDomain: "join-e9b30.firebaseapp.com", messagingSenderId: "600355908800", })), provideFirestore(() => getFirestore()), provideAuth(() => getAuth())
  ]
};

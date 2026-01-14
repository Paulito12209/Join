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
    provideRouter(routes), provideFirebaseApp(() => initializeApp({ projectId: "join-main-4c561", appId: "1:439753953442:web:65a4bdc9aca859602b07fb", storageBucket: "join-main-4c561.firebasestorage.app", apiKey: "AIzaSyBzvcgonWeMJUphPB1kVE1USJuXmUMS8dA", authDomain: "join-main-4c561.firebaseapp.com", messagingSenderId: "439753953442", })), provideFirestore(() => getFirestore()), provideAuth(() => getAuth())
  ]
};

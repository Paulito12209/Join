import { Routes } from '@angular/router';
import { Contacts } from './pages/contacts/contacts';
import { MainLayout } from './core/layouts/main-layout/main-layout';
import { Summary } from './pages/summary/summary';
import { Board } from './pages/board/board';
import { AddTask } from './pages/add-task/add-task';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';
import { LegalNotes } from './pages/legal-notes/legal-notes';
import { Help } from './pages/help/help';

export const routes: Routes = [{
    path: "", component: MainLayout, children: [
        { path: "contacts", component: Contacts },
        { path: "summary", component: Summary },
        { path: "board", component: Board },
        { path: "add-task", component: AddTask },
        { path: "privacy-policy", component: PrivacyPolicy },
        { path: "legal-notice", component: LegalNotes },
        { path: "help", component: Help },
        { path: "", redirectTo: "contacts", pathMatch: "full" },

            {
      path: 'contacts/add',
      loadComponent: () => import('./pages/contacts/dialog-contact').then(m => m.DialogContact),
    },
    {
      path: 'contacts/:id/edit',
      loadComponent: () => import('./pages/contacts/dialog-contact').then(m => m.DialogContact),
    },

    { path: '', redirectTo: 'contacts', pathMatch: 'full' },
    ]
}];

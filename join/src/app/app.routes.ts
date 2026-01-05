import { Routes } from '@angular/router';
import { Contacts } from './pages/contacts/contacts';
import { MainLayout } from './core/layouts/main-layout/main-layout';
import { Summary } from './pages/summary/summary';
import { AddTask } from './pages/add-task/add-task';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';
import { LegalNotes } from './pages/legal-notes/legal-notes';
import { Help } from './pages/help/help';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((m) => m.Register),
  },

  // Public pages WITH layout (sidebar/header visible)
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'privacy-policy', component: PrivacyPolicy },
      { path: 'legal-notice', component: LegalNotes },
    ],
  },

  // Protected app area WITH layout
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'contacts', component: Contacts },
      { path: 'summary', component: Summary },
      { path: 'add-task', component: AddTask },
      { path: 'help', component: Help },
      { path: '', redirectTo: 'summary', pathMatch: 'full' },

      {
        path: 'contacts/add',
        loadComponent: () => import('./pages/contacts/dialog-contact').then((m) => m.DialogContact),
      },
      {
        path: 'contacts/:id/edit',
        loadComponent: () => import('./pages/contacts/dialog-contact').then((m) => m.DialogContact),
      },

      {
        path: 'board',
        loadComponent: () => import('./pages/board/board').then((m) => m.Board),
        children: [
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/board/task-dialog/task-dialog').then((m) => m.TaskDialog),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./pages/board/task-dialog/task-dialog').then((m) => m.TaskDialog),
          },
        ],
      },
    ],
  },
];

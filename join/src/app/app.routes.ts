import { Routes } from '@angular/router';
import { Contacts } from './pages/contacts/contacts';
import { MainLayout } from './core/layouts/main-layout/main-layout';
import { Summary } from './pages/summary/summary';
import { AddTask } from './pages/add-task/add-task';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';
import { LegalNotes } from './pages/legal-notes/legal-notes';
import { Help } from './pages/help/help';
import { authGuard } from './core/guards/auth.guard';

/**
 * Application route configuration.
 *
 * @remarks
 * Defines public and protected routes of the application.
 * Routes are organized using a shared main layout and
 * route-level guards for authenticated areas.
 */
export const routes: Routes = [
  /**
   * Default redirect to the login page.
   */
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  /**
   * Login page route.
   */
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },

  /**
   * Registration page route.
   */
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((m) => m.Register),
  },

  /**
   * Public pages rendered within the main layout.
   */
  {
    path: '',
    component: MainLayout,
    children: [
      /**
       * Privacy policy page.
       */
      { path: 'privacy-policy', component: PrivacyPolicy },

      /**
       * Legal notice page.
       */
      { path: 'legal-notice', component: LegalNotes },
    ],
  },

  /**
   * Protected application area.
   *
   * @remarks
   * All child routes require authentication and are rendered
   * within the main layout.
   */
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      /**
       * Contacts overview page.
       */
      { path: 'contacts', component: Contacts },

      /**
       * Summary dashboard page.
       */
      { path: 'summary', component: Summary },

      /**
       * Add task page.
       */
      { path: 'add-task', component: AddTask },

      /**
       * Help page.
       */
      { path: 'help', component: Help },

      /**
       * Default redirect to summary.
       */
      { path: '', redirectTo: 'summary', pathMatch: 'full' },

      /**
       * Create new contact dialog.
       */
      {
        path: 'contacts/add',
        loadComponent: () => import('./pages/contacts/dialog-contact').then((m) => m.DialogContact),
      },

      /**
       * Edit existing contact dialog.
       */
      {
        path: 'contacts/:id/edit',
        loadComponent: () => import('./pages/contacts/dialog-contact').then((m) => m.DialogContact),
      },

      /**
       * Board page with nested task dialogs.
       */
      {
        path: 'board',
        loadComponent: () => import('./pages/board/board').then((m) => m.Board),
        children: [
          /**
           * Task details dialog.
           */
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/board/task-dialog/task-dialog').then((m) => m.TaskDialog),
          },

          /**
           * Task edit dialog.
           */
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

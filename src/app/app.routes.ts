import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'menu',
        loadComponent: () =>
            import('./pages/menu/menu.page').then((m) => m.MenuPage),
    },
    {
        path: 'play',
        loadComponent: () =>
            import('./pages/play/play.page').then((m) => m.PlayPage),
    },
    {
        path: '**',
        redirectTo: 'menu',
    },
];

import { Route, Routes } from '@angular/router';
import { AppComponent } from './app.component';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/menu/menu.page').then((m) => m.MenuPage),
    },
    {
        path: 'play',
        loadComponent: () =>
            import('./pages/play/play.page').then((m) => m.PlayPage),
    },
];

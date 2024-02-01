import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: Pages.ACCESSIBILITY_PAGE,
        loadComponent: () =>
            import('./pages/accessibility/accessibility.page').then(
                (m) => m.AccessibilityPage,
            ),
    },
    {
        path: Pages.MENU_PAGE,
        loadComponent: () =>
            import('./pages/menu/menu.page').then((m) => m.MenuPage),
    },
    {
        path: Pages.PLAY_PAGE,
        loadComponent: () =>
            import('./pages/play/play.page').then((m) => m.PlayPage),
    },
    {
        path: Pages.ADVERTISEMENT_PAGE,
        loadComponent: () =>
            import('./pages/advertisement/advertisement.page').then(
                (m) => m.AdvertisementPage,
            ),
    },
    {
        path: '**',
        redirectTo: Pages.MENU_PAGE,
    },
];

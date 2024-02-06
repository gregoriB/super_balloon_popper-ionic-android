import { Routes } from '@angular/router';
import { AccessibilityPage } from './pages/accessibility/accessibility.page';

export const routes: Routes = [
    {
        path: Pages.ACCESSIBILITY_PAGE,
        component: AccessibilityPage,
    },
    {
        path: Pages.ADVERTISEMENT_PAGE,
        loadComponent: () =>
            import('./pages/advertisement/advertisement.page').then(
                (m) => m.AdvertisementPage,
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
];

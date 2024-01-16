import { Route } from'@angular/router';

export const routes: Route[] = [
 {
   path:'',
   loadChildren: () => import('./tabs/tabs.routes').then((m) =>m.routes),
 },
];

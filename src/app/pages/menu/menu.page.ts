import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.page.html',
    styleUrl: './menu.page.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterModule],
})
export class MenuPage {}

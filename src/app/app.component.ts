import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    standalone: true,
    imports: [IonicModule, RouterModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
    private router = inject(Router);

    ngOnInit() {
        this.router.navigate(['']);
    }
}

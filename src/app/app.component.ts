import { AndroidFullScreen } from '@awesome-cordova-plugins/android-full-screen/ngx';
import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    inject,
    signal,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
    IonicModule,
    MenuController,
    Platform,
    ViewDidEnter,
} from '@ionic/angular';
import { IonRouterOutlet } from '@ionic/angular/common';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    standalone: true,
    imports: [IonicModule, RouterModule],
    providers: [AndroidFullScreen, IonRouterOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, ViewDidEnter {
    private router = inject(Router);
    private routerOutlet = inject(IonRouterOutlet);
    private androidFullScreen = inject(AndroidFullScreen);
    private platform = inject(Platform);
    private menuController = inject(MenuController);

    async ngOnInit() {
        await this.platform.ready();
        this.platform.backButton.subscribe(() => {
            const navigator = window.navigator as any;
            const app: any = navigator['app'];
            app.exitApp();
        });
        this.enterFullScreenMode();
        this.router.navigate(['play']);
    }

    ionViewDidEnter() {
        this.routerOutlet.swipeGesture = false;
        this.menuController.swipeGesture(false);
    }

    enterFullScreenMode() {
        if (this.isAndroid) {
            this.setAndroidFullScreen();
        }
        if (this.isIOS) {
            this.setIOSFullScreen();
        }
    }

    get isAndroid(): boolean {
        return this.platform.is('android');
    }

    get isIOS(): boolean {
        return this.platform.is('ios');
    }

    async setAndroidFullScreen() {
        const isImmersiveModeSupported =
            await this.androidFullScreen.isImmersiveModeSupported();
        if (isImmersiveModeSupported) {
            this.androidFullScreen.immersiveMode();
        }
    }

    setIOSFullScreen(): void {
        // TODO
    }
}

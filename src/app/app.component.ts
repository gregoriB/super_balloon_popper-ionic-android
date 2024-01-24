import {
    AndroidFullScreen,
    AndroidSystemUiFlags,
} from '@awesome-cordova-plugins/android-full-screen/ngx';
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
import { NgIf, PlatformLocation } from '@angular/common';
import { TouchPatternComponent } from './components/touch-pattern/touch-pattern.component';
import { App } from '@capacitor/app';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    standalone: true,
    imports: [IonicModule, RouterModule, TouchPatternComponent, NgIf],
    providers: [AndroidFullScreen, IonRouterOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, ViewDidEnter {
    private router = inject(Router);
    private routerOutlet = inject(IonRouterOutlet);
    private location = inject(PlatformLocation);
    private androidFullScreen = inject(AndroidFullScreen);
    private platform = inject(Platform);
    private menuController = inject(MenuController);
    private exitTimeout = 0;
    maxTouchToExit = 4;
    isTouchPattern = signal(false);
    touchCount = signal(this.maxTouchToExit);

    async ngOnInit() {
        this.initializeDefaults();
        await this.platform.ready();
        this.listenForAppStateChange();
        this.handlePlatformBackButton();
        this.handlePopStateChanges();
        this.enterFullScreenMode();
        this.routeToMenu();
    }

    initializeDefaults() {
        this.isTouchPattern.set(false);
        this.touchCount.set(this.maxTouchToExit);
    }

    routeToMenu() {
        this.router.navigateByUrl('play');
    }

    exitApp(): void {
        const navigator = window.navigator as any;
        const app: any = navigator['menu'];
        app.exitApp();
    }

    listenForAppStateChange() {
        App.addListener('appStateChange', ({ isActive }) => {
            this.handleVisibilityChange(isActive);
        });
    }

    handleVisibilityChange(isActive: boolean) {
        if (isActive) {
            return;
        }
        this.reloadApp();
    }

    handlePopStateChanges() {
        this.location.onPopState(() => {
            if (this.path === '/menu') {
                this.reloadApp();
            }
        });
    }

    handlePlatformBackButton() {
        this.platform.backButton.subscribeWithPriority(1, () => {
            switch (this.path) {
                case '/advertisement':
                    return;
                case '/play':
                    if (!this.exitTimeout) {
                        this.displaySytemUI();
                    }
                    this.handleTouchToExit();
                    break;
                default:
                    this.exitApp();
            }
        });
    }

    displaySytemUI() {
        this.androidFullScreen.showUnderSystemUI();
        this.androidFullScreen.showUnderStatusBar();
        this.androidFullScreen.setSystemUiVisibility(
            AndroidSystemUiFlags.LayoutStable |
                AndroidSystemUiFlags.LayoutFullscreen,
        );
    }

    handleTouchToExit() {
        this.isTouchPattern.set(true);
        if (this.exitTimeout) {
            clearTimeout(this.exitTimeout);
            this.exitTimeout = 0;
        }

        const maxTimeout =
            this.touchCount() < this.maxTouchToExit
                ? 1000 * this.touchCount()
                : 5000;
        this.exitTimeout = window.setTimeout(() => {
            this.initializeDefaults();
            this.enterFullScreenMode();
            this.exitTimeout = 0;
        }, maxTimeout);

        if (this.touchCount() <= 1) {
            clearTimeout(this.exitTimeout);
            this.exitTimeout = 0;
            this.initializeDefaults();
            this.exitApp();
            return;
        }

        this.touchCount.update((count) => count - 1);
    }

    get path() {
        return this.location.pathname;
    }

    reloadApp() {
        document.location.reload();
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

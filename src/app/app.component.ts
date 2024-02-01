import {
    AndroidFullScreen,
    AndroidSystemUiFlags,
} from '@awesome-cordova-plugins/android-full-screen/ngx';
import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation,
    inject,
    signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule, MenuController, Platform } from '@ionic/angular';
import { IonRouterOutlet } from '@ionic/angular/common';
import { NgIf, PlatformLocation } from '@angular/common';
import { TouchPatternComponent } from './components/touch-pattern/touch-pattern.component';
import { App } from '@capacitor/app';
import { NavigationService } from './services/navigation.service';
import { StorageService } from './services/storage.service';
import { Storage } from '@ionic/storage';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    standalone: true,
    imports: [IonicModule, RouterModule, TouchPatternComponent, NgIf],
    providers: [
        AndroidFullScreen,
        IonRouterOutlet,
        Storage,
        StorageService,
        NavigationService,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
    private routerOutlet = inject(IonRouterOutlet);
    private location = inject(PlatformLocation);
    private androidFullScreen = inject(AndroidFullScreen);
    private platform = inject(Platform);
    private menuController = inject(MenuController);
    private navigation = inject(NavigationService);
    private exitTimeout = 0;
    maxTouchToExit = 4;
    isTouchPattern = signal(false);
    touchCount = signal(0);

    async ngOnInit() {
        this.initializeDefaults();
        await this.platform.ready();
        //// Disable this because causing bugs
        //// when using interaction control
        // this.listenForAppStateChange();
        this.handlePlatformBackButton();
        this.handlePopStateChanges();
        this.enterFullScreenMode();
        this.navigation.proceedFrom(Pages.APP_PAGE);
    }

    initializeDefaults() {
        this.isTouchPattern.set(false);
        this.touchCount.set(0);
    }

    exitApp(): void {
        App.exitApp();
    }

    // listenForAppStateChange() {
    //     App.addListener('appStateChange', ({ isActive }) => {
    //         this.handleVisibilityChange(isActive);
    //     });
    // }
    //
    // handleVisibilityChange(isActive: boolean) {
    //     if (isActive) {
    //         return;
    //     }
    //     this.reloadApp();
    // }
    //
    handlePopStateChanges() {
        this.location.onPopState(() => {
            if (this.path === '/menu') {
                this.reloadApp();
            }
        });
    }

    handlePlatformBackButton() {
        this.platform.backButton.subscribeWithPriority(1, () => {
            const isAdPage = this.path.includes('/advertisement');
            const isPlayPage = this.path.includes('/play');
            const isMenuPage = this.path.includes('/menu');
            const isAccessibilityPage = this.path.includes('/accessibility');
            if (isAdPage) return;
            if (isPlayPage) {
                if (!this.exitTimeout) {
                    this.initializeTouchToExit();
                }
                this.handleTouchToExit();
                return;
            }
            if (isMenuPage) {
                this.exitApp();
            }
            if (isAccessibilityPage) {
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

    initializeTouchToExit() {
        this.displaySytemUI();
        this.touchCount.set(this.maxTouchToExit);
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
            this.navigation.proceedFrom(Pages.PLAY_PAGE);
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

    get isWeb(): boolean {
        return this.platform.is('mobileweb') || this.platform.is('pwa');
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

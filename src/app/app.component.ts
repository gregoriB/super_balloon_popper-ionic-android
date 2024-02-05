import {
    AndroidFullScreen,
    AndroidSystemUiFlags,
} from '@awesome-cordova-plugins/android-full-screen/ngx';
import {
    Component,
    OnInit,
    ViewEncapsulation,
    inject,
    signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule, MenuController, Platform } from '@ionic/angular';
import { IonRouterOutlet } from '@ionic/angular/common';
import { NgIf } from '@angular/common';
import { TouchPatternComponent } from './components/touch-pattern/touch-pattern.component';
import { NavigationService } from './services/navigation.service';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    standalone: true,
    imports: [IonicModule, RouterModule, TouchPatternComponent, NgIf],
    providers: [AndroidFullScreen, IonRouterOutlet, NavigationService],
    encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
    private routerOutlet = inject(IonRouterOutlet);
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
        this.handleBackButton();
        this.enterFullScreenMode();
    }

    initializeDefaults() {
        this.isTouchPattern.set(false);
        this.touchCount.set(0);
        this.routerOutlet.swipeGesture = false;
        this.menuController.swipeGesture(false);
    }

    handleBackButton() {
        this.platform.backButton.subscribeWithPriority(5, () => {
            const isPlayPage = this.navigation.isCurrentPage(Pages.PLAY_PAGE);
            if (isPlayPage) {
                if (!this.exitTimeout) {
                    this.initializeTouchToExit();
                }
                this.handleTouchToExit();
            }
        });
    }

    displaySystemUI() {
        this.androidFullScreen.showUnderSystemUI();
        this.androidFullScreen.showUnderStatusBar();
        this.androidFullScreen.setSystemUiVisibility(
            AndroidSystemUiFlags.LayoutStable |
                AndroidSystemUiFlags.LayoutFullscreen,
        );
    }

    initializeTouchToExit() {
        this.displaySystemUI();
        this.touchCount.set(this.maxTouchToExit);
    }

    async handleTouchToExit() {
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
            this.navigation.proceedToNextStep();
            return;
        }

        this.touchCount.update((count) => count - 1);
    }

    enterFullScreenMode() {
        if (this.isAndroid) {
            this.setAndroidFullScreen();
        }
        if (this.isIOS) {
            // TODO: IOS fullscreen logic
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
}

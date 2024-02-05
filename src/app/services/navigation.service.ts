import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { App } from '@capacitor/app';
import { Platform } from '@ionic/angular';
import { PlatformLocation } from '@angular/common';

/**
 * Service maintains complete control over app navigation,
 * including exiting the app when needed.
 */
@Injectable({ providedIn: 'root' })
export class NavigationService {
    private history: Pages[] = [];
    private hasVisited = false;

    constructor(
        private router: Router,
        private platform: Platform,
        private location: PlatformLocation,
        private storageService: StorageService,
    ) {
        setTimeout(this.initialize.bind(this));
    }

    get isWeb(): boolean {
        return this.platform.is('mobileweb') || this.platform.is('pwa');
    }

    async initialize() {
        this.subscribeToBackButton();
        const isInit = await this.storageService.get('init');
        this.hasVisited = Boolean(isInit);
        this.proceedToNextStep();
    }

    proceedToNextStep() {
        this.proceedFrom(this.currentPage);
    }

    private proceedFrom(page: Pages) {
        switch (page) {
            case Pages.ACCESSIBILITY_PAGE:
                this.proceedFromAccessibilityPage();
                break;
            case Pages.ADVERTISEMENT_PAGE:
                this.proceedFromAdvertisementPage();
                break;
            case Pages.MENU_PAGE:
                this.proceedFromMenuPage();
                break;
            case Pages.PLAY_PAGE:
                this.proceedFromPlayPage();
                break;
            case Pages.APP_PAGE:
                this.proceedFromAppPage();
                break;
            default:
                return;
        }
        this.history.push(this.currentPage);
    }

    private subscribeToBackButton() {
        this.platform.backButton.subscribeWithPriority(10, (next) => {
            if (this.isCurrentPage(Pages.ACCESSIBILITY_PAGE)) {
                this.exitApp();
            }
            if (this.isCurrentPage(Pages.MENU_PAGE)) {
                this.exitApp();
            }
            next();
        });
    }

    private setHasVisited(val: boolean) {
        this.storageService.set('init', val);
        this.hasVisited = val;
    }

    private proceedFromAccessibilityPage(): Pages {
        let newPage = Pages.ADVERTISEMENT_PAGE;
        if (!this.hasVisited || this.isWeb) {
            newPage = Pages.MENU_PAGE;
            this.setHasVisited(true);
        }
        return this.navigateByUrl(newPage);
    }

    private proceedFromAdvertisementPage(): Pages {
        if (this.isLastPage(Pages.ACCESSIBILITY_PAGE)) {
            return this.navigateByUrl(Pages.MENU_PAGE);
        } else {
            this.exitApp();
            return Pages.APP_PAGE;
        }
    }

    private proceedFromMenuPage(): Pages {
        return this.navigateByUrl(Pages.PLAY_PAGE);
    }

    private proceedFromPlayPage(): Pages {
        return this.navigateByUrl(Pages.ADVERTISEMENT_PAGE);
    }

    private proceedFromAppPage(): Pages {
        return this.navigateByUrl(Pages.ACCESSIBILITY_PAGE);
    }

    private navigateByUrl(page: Pages): Pages {
        this.router.navigateByUrl(String(page));
        return page;
    }

    private exitApp(): void {
        App.exitApp();
    }

    private get lastPage(): Pages {
        return this.history[this.history.length - 1];
    }

    isLastPage(page: Pages): Boolean {
        return Boolean(this.lastPage === page);
    }

    get currentPage(): Pages {
        if (!this.lastPage) {
            return Pages.APP_PAGE;
        }
        const path = this.location.pathname.slice(1) || Pages.APP_PAGE;
        return path as Pages;
    }

    isCurrentPage(page: Pages) {
        return this.currentPage === page;
    }
}

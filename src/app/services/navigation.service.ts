import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { App } from '@capacitor/app';
import { Platform } from '@ionic/angular';
import { PlatformLocation } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class NavigationService {
    private router = inject(Router);
    private platform = inject(Platform);
    private location = inject(PlatformLocation);
    private storageService = inject(StorageService);
    private history: Pages[] = [];
    private hasVisited = false;

    constructor() {
        setTimeout(() => this.initialize());
    }

    initialize() {
        this.subscribeToBackButton();
        this.storageService.get('init').then((val: boolean | undefined) => {
            this.hasVisited = Boolean(val);
        });
        this.proceedFromAppPage();
    }

    proceedToNextStep() {
        this.proceedFrom(this.currentPage);
    }

    proceedFrom(page: Pages) {
        let pageChangeMethod: () => Pages;
        switch (page) {
            case Pages.ACCESSIBILITY_PAGE:
                pageChangeMethod = this.proceedFromAccessibilityPage;
                break;
            case Pages.ADVERTISEMENT_PAGE:
                pageChangeMethod = this.proceedFromAdvertisementPage;
                break;
            case Pages.MENU_PAGE:
                pageChangeMethod = this.proceedFromMenuPage;
                break;
            case Pages.PLAY_PAGE:
                pageChangeMethod = this.proceedFromPlayPage;
                break;
            case Pages.APP_PAGE:
                pageChangeMethod = this.proceedFromAppPage;
                break;
            default:
                return;
        }
        pageChangeMethod.call(this);
        this.history.push(this.currentPage);
    }

    private subscribeToBackButton() {
        this.platform.backButton.subscribeWithPriority(1, () => {
            if (this.isCurrentPage(Pages.ACCESSIBILITY_PAGE)) {
                this.exitApp();
            }
            if (this.isCurrentPage(Pages.MENU_PAGE)) {
                this.exitApp();
            }
        });
    }

    private setHasVisited(val: boolean) {
        this.storageService.set('init', val);
        this.hasVisited = val;
    }

    private proceedFromAccessibilityPage(): Pages {
        let newPage = Pages.ADVERTISEMENT_PAGE;
        if (!this.hasVisited) {
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

    private isLastPage(page: Pages) {
        return this.lastPage === page;
    }

    get currentPage(): Pages {
        if (!this.lastPage) {
            return Pages.APP_PAGE;
        }
        const path = this.location.pathname.slice(1) || Pages.APP_PAGE;
        return path as Pages;
    }

    private isCurrentPage(page: Pages) {
        return this.currentPage === page;
    }
}

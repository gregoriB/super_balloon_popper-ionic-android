import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { App } from '@capacitor/app';

@Injectable({
    providedIn: 'root',
})
export class NavigationService {
    private router = inject(Router);
    private storageService = inject(StorageService);
    private history: Pages[] = [];

    private get lastPage(): Pages {
        return this.history[this.history.length - 1];
    }

    proceedFrom(page: Pages) {
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
        this.history.push(page);
    }

    private async hasVisited() {
        return this.storageService.get('init');
    }

    private async setHasVisited(val: boolean) {
        this.storageService.set('init', val);
    }

    private async proceedFromAccessibilityPage() {
        const hasVisited = await this.hasVisited();
        if (!hasVisited) {
            this.setHasVisited(true);
            this.navigateByUrl(Pages.MENU_PAGE);
        } else {
            this.navigateByUrl(Pages.ADVERTISEMENT_PAGE);
        }
    }

    private proceedFromAdvertisementPage() {
        if (this.isLastPage(Pages.ACCESSIBILITY_PAGE)) {
            this.navigateByUrl(Pages.MENU_PAGE);
        } else {
            this.exitApp();
        }
    }

    private proceedFromMenuPage() {
        this.navigateByUrl(Pages.PLAY_PAGE);
    }

    private proceedFromPlayPage() {
        this.navigateByUrl(Pages.ADVERTISEMENT_PAGE);
    }

    private proceedFromAppPage() {
        this.navigateByUrl(Pages.ACCESSIBILITY_PAGE);
    }

    private navigateByUrl(page: Pages) {
        this.router.navigateByUrl(String(page));
    }

    private exitApp(): void {
        App.exitApp();
    }

    isLastPage(page: Pages) {
        return this.lastPage === page;
    }
}

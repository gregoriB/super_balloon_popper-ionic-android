import { NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    effect,
    inject,
    signal,
} from '@angular/core';
import { PluginListenerHandle } from '@capacitor/core';
import { ViewWillEnter, ViewWillLeave } from '@ionic/angular';
import { AdService } from 'src/app/services/ad.service';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
    selector: 'app-advertisement',
    templateUrl: './advertisement.page.html',
    styleUrls: ['./advertisement.page.scss'],
    imports: [NgIf],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class AdvertisementPage implements ViewWillEnter, ViewWillLeave {
    private navigation = inject(NavigationService);
    private adService = inject(AdService);
    isReadyToProceed = signal(false);
    isDisabled = signal(true);
    isLoading = signal(false);
    onLoad: PluginListenerHandle | undefined;
    onShow: PluginListenerHandle | undefined;
    onFail: PluginListenerHandle | undefined;
    onDismiss: PluginListenerHandle | undefined;

    constructor() {
        effect(() => {
            // Using this as a workaround for weird
            // performance issues that come from
            // proceeding directly from the listeners
            this.proceedToNextStep();
        });
    }

    ionViewWillEnter() {
        this.isReadyToProceed.set(false);
        this.isLoading.set(true);
        this.addListeners();
    }

    addListeners() {
        this.onLoad = this.adService.onLoadedInterstitial(() => {
            this.adService.showInterstitial();
        });
        this.onShow = this.adService.onShowInterstitial(() => {
            this.isLoading.set(false);
        });
        this.onFail = this.adService.onFailInterstitial(() => {
            this.isLoading.set(false);
            this.setReadyToProceed();
        });
        this.onDismiss = this.adService.onDismissedInterstitial(() => {
            this.setReadyToProceed();
        });
    }

    async removeListeners() {
        Promise.all([
            this.onLoad?.remove(),
            this.onDismiss?.remove(),
            this.onShow?.remove(),
            this.onFail?.remove(),
        ]);
        this.onLoad = this.onDismiss = this.onShow = this.onFail = undefined;
    }

    async ionViewWillLeave() {
        this.isReadyToProceed.set(false);
        this.isLoading.set(false);
        this.isDisabled.set(true);
        await this.removeListeners();
        this.adService.prepareInterstitial();
    }

    setReadyToProceed() {
        this.isReadyToProceed.set(true);
    }

    handleButtonClick() {
        this.setReadyToProceed();
    }

    proceedToNextStep() {
        if (!this.isReadyToProceed()) return;
        this.navigation.proceedToNextStep();
    }
}

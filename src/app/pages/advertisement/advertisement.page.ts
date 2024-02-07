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
import { adTimeout } from 'src/environments/environment';

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
    timeout: any;

    constructor() {
        effect(() => {
            // Using this as a workaround for weird
            // performance issues that come from
            // proceeding directly from the listeners
            if (this.isReadyToProceed()) {
                this.proceedToNextStep();
            }
        });
    }

    ionViewWillEnter() {
        this.isReadyToProceed.set(false);
        this.isLoading.set(true);
        this.addListeners();
        this.timeout = setTimeout(() => {
            this.setReadyToProceed();
            clearTimeout(this.timeout);
        }, adTimeout);
    }

    addListeners() {
        this.onShow = this.adService.onShowInterstitial(() => {
            clearTimeout(this.timeout);
            this.isLoading.set(false);
        });
        this.onFail = this.adService.onFailInterstitial(() => {
            clearTimeout(this.timeout);
            setTimeout(() => {
              this.isLoading.set(false);
              this.setReadyToProceed();
            }, 500);
        });
        this.onDismiss = this.adService.onDismissedInterstitial(() => {
            setTimeout(() => {
              clearTimeout(this.timeout);
              this.setReadyToProceed();
            }, 500);
        });
    }

    async removeListeners() {
        this.onLoad?.remove();
        this.onDismiss?.remove();
        this.onShow?.remove();
        this.onFail?.remove();
        this.onLoad = this.onDismiss = this.onShow = this.onFail = undefined;
    }

    async ionViewWillLeave() {
        this.isReadyToProceed.set(false);
        this.isLoading.set(false);
        this.isDisabled.set(true);
        this.removeListeners();
    }

    setReadyToProceed() {
        this.isReadyToProceed.set(true);
    }

    handleButtonClick() {
        this.setReadyToProceed();
    }

    proceedToNextStep() {
        this.navigation.proceedToNextStep();
    }
}

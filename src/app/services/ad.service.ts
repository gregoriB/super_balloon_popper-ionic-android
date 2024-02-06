import { Injectable, computed, signal } from '@angular/core';
import {
    AdMob,
    AdmobConsentStatus,
    InterstitialAdPluginEvents,
} from '@capacitor-community/admob';
import { PluginListenerHandle } from '@capacitor/core';
import {
    adIdFirst,
    adIdSecond,
    adTimeout,
    environment,
} from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AdService {
    private interstitialAdIds = [adIdFirst, adIdSecond];
    private interstitialAdCount = signal(0);
    private currentInterstitialAdId = computed(() => {
        const i = this.interstitialAdCount() > 1 ? 1 : 0;
        return this.interstitialAdIds[i];
    });

    get adMob() {
        return AdMob;
    }

    async initializeAndPrepare() {
        await this.initialize();
        this.prepareInterstitial();
    }

    async initialize() {
        return AdMob.initialize({
            tagForChildDirectedTreatment: true,
            tagForUnderAgeOfConsent: true,
            initializeForTesting: true,
            testingDevices: ['8f9fbef3-0ad5-4497-ba75-2863e7b51805'],
            // initializeForTesting: true,
            // testingDevices: ['8f9fbef3-0ad5-4497-ba75-2863e7b51805'],
        });
        // return new Promise(async (res, rej) => {
        //   await AdMob.initialize({
        //     tagForChildDirectedTreatment: true,
        //     tagForUnderAgeOfConsent: true,
        //     initializeForTesting: true,
        //     testingDevices: ['8f9fbef3-0ad5-4497-ba75-2863e7b51805'],
        //   });
        //   // return res(true);
        //
        //   setTimeout(() => {
        //     res(true);
        //   }, 1000);
        //
        //   const [trackingInfo, consentInfo] = await Promise.all([
        //       AdMob.trackingAuthorizationStatus(),
        //       AdMob.requestConsentInfo(),
        //   ]);
        //
        //   if (trackingInfo.status === 'notDetermined') {
        //       /**
        //       * If you want to explain TrackingAuthorization before showing the iOS dialog,
        //       * you can show the modal here.
        //       * ex)
        //       * const modal = await this.modalCtrl.create({
        //       *   component: RequestTrackingPage,
        //       * });
        //       * await modal.present();
        //       * await modal.onDidDismiss();  // Wait for close modal
        //       **/
        //
        //       await AdMob.requestTrackingAuthorization();
        //   }
        //
        //   const authorizationStatus = await AdMob.trackingAuthorizationStatus();
        //   if (
        //       authorizationStatus.status === 'authorized' &&
        //       consentInfo.isConsentFormAvailable &&
        //       consentInfo.status === AdmobConsentStatus.REQUIRED
        //   ) {
        //       await AdMob.showConsentForm();
        //   }
        //   return res(true);
        // });
    }

    async prepareInterstitial() {
        this.interstitialAdCount.update((ic) => ic++);
        await AdMob.prepareInterstitial({
            isTesting: true,
            adId: this.currentInterstitialAdId(),
        });
    }

    showInterstitial() {
        return new Promise((res) => {
            let timeout: any;
            let onLoad = this.onLoadedInterstitial(() => {
                AdMob.showInterstitial();
                onLoad.remove();
                clearTimeout(timeout);
                res(true);
            });
            setTimeout(() => {
                onLoad.remove();
                res(false);
            }, adTimeout);
        });
    }

    onShowInterstitial(callback: () => void) {
        return AdMob.addListener(InterstitialAdPluginEvents.Showed, callback);
    }

    onFailInterstitial(callback: () => void): PluginListenerHandle {
        const failShow = AdMob.addListener(
            InterstitialAdPluginEvents.FailedToShow,
            callback,
        );

        const failLoad = AdMob.addListener(
            InterstitialAdPluginEvents.FailedToLoad,
            callback,
        );

        return {
            remove: async () => {
                await failShow.remove();
                await failLoad.remove();
            },
        };
    }

    onLoadedInterstitial(callback: () => void) {
        return AdMob.addListener(InterstitialAdPluginEvents.Loaded, callback);
    }

    onDismissedInterstitial(callback: () => void) {
        return AdMob.addListener(
            InterstitialAdPluginEvents.Dismissed,
            callback,
        );
    }
}

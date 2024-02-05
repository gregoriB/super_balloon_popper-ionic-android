import { Injectable, computed, effect, signal } from '@angular/core';
import {
    AdMob,
    AdmobConsentStatus,
    InterstitialAdPluginEvents,
} from '@capacitor-community/admob';
import { PluginListenerHandle } from '@capacitor/core';
enum PluginEvent {
    LOADED = InterstitialAdPluginEvents.Loaded,
    DISMISSED = InterstitialAdPluginEvents.Dismissed,
}
type adListener = undefined | PluginListenerHandle;
type adListeners = { [key: string]: adListener };

// const beforePlay = 'ca-app-pub-3940256099942544/1033173712';
// const afterPlay = 'ca-app-pub-3940256099942544/1033173712';
const beforePlay = 'ca-app-pub-4865009216016262/1853853129';
const afterPlay = 'ca-app-pub-4865009216016262/9592456930';

@Injectable({
    providedIn: 'root',
})
export class AdService {
    private interstitialAdIds = [beforePlay, afterPlay];
    private interstitialAdCount = signal(0);
    private currentInterstitialAdId = computed(() => {
        const i = this.interstitialAdCount() > 1 ? 1 : 0;
        return this.interstitialAdIds[i];
    });

    async initializeAndPrepare() {
        this.initialize().then(() => this.prepareInterstitial());
    }

    async initialize() {
        return AdMob.initialize({
            tagForChildDirectedTreatment: true,
            tagForUnderAgeOfConsent: true,
            initializeForTesting: true,
            testingDevices: ['8f9fbef3-0ad5-4497-ba75-2863e7b51805'],
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
        return AdMob.prepareInterstitial({
            isTesting: true,
            adId: this.currentInterstitialAdId(),
        });
    }

    showInterstitial() {
        AdMob.showInterstitial();
    }

    get defaultListeners(): adListeners {
        return {
            dismissed: undefined,
            loaded: undefined,
            failedToLoad: undefined,
            failedToShow: undefined,
            showed: undefined,
        };
    }

    get adMob() {
        return AdMob;
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

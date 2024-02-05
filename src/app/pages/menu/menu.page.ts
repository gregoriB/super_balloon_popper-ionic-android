import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    inject,
    signal,
} from '@angular/core';
import { ViewDidEnter, ViewDidLeave } from '@ionic/angular';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.page.html',
    styleUrl: './menu.page.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuPage implements ViewDidLeave, ViewDidEnter {
    private navigation = inject(NavigationService);
    isClicked = signal(false);
    isAnimated = signal(false);
    navigationDelay = 1700;
    animationTimeout: any;

    ionViewDidEnter() {
        if (this.animationTimeout) return;
        this.animationTimeout = setTimeout(() => {
            this.isAnimated.set(true);
            clearTimeout(this.animationTimeout);
            this.animationTimeout = undefined;
        }, 16);
        this.initializeFlags();
    }

    ionViewDidLeave() {
        this.initializeFlags();
    }

    proceedToNextStep() {
        if (this.isClicked()) {
            return;
        }
        this.isClicked.set(true);
        this.playInflateAudio();
        setTimeout(() => {
            this.navigation.proceedToNextStep();
            this.initializeFlags();
        }, this.navigationDelay);
    }

    initializeFlags() {
        this.isClicked.set(false);
        this.isAnimated.set(false);
    }

    playInflateAudio() {
        const inflateSound = new Audio('../../../assets/sounds/inflate.flac');
        inflateSound.play();
        inflateSound.playbackRate = 3;
        setTimeout(this.playPopAudio, 800);
    }

    playPopAudio() {
        const popSound = new Audio('../../../assets/sounds/pop.flac');
        popSound.play();
    }
}

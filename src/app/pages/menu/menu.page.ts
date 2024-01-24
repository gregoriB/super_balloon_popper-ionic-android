import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    inject,
    signal,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NavigationDelayDirective } from 'src/app/directives/navigation-delay.directive';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.page.html',
    styleUrl: './menu.page.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterModule, NavigationDelayDirective],
})
export class MenuPage implements OnInit {
    private router = inject(Router);
    isClicked = signal(false);
    isAnimated = signal(false);
    navigationDelay = 1700;

    ngOnInit() {
        setTimeout(() => this.isAnimated.set(true), 16);
        this.initializeFlags();
    }

    navigateToPlay() {
        if (this.isClicked()) {
            return;
        }
        this.isClicked.set(true);
        this.playInflateAudio();
        setTimeout(() => {
            this.router.navigate(['play']);
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

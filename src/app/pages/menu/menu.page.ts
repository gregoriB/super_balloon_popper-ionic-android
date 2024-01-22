import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.page.html',
    styleUrl: './menu.page.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterModule],
})
export class MenuPage {
  private router = inject(Router);
  isClicked = signal(false);

  navigateToPlay() {
    if (this.isClicked()) {
      return;
    }
    this.isClicked.set(true);
    this.playInflateAudio();
    window.setTimeout(() => {
      this.router.navigate(['play']);
    }, 1600);
  }

  playInflateAudio() {
      const inflateSound = new Audio('../../../assets/sounds/inflate.flac');
      inflateSound.play();
      inflateSound.playbackRate = 2.9;
      setTimeout(this.playPopAudio, 700);
  }

  playPopAudio() {
      const popSound = new Audio('../../../assets/sounds/pop.flac');
      popSound.play();
    }
}

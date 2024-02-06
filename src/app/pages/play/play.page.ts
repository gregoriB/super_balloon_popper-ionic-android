import {
    ChangeDetectionStrategy,
    Component,
    HostListener,
    effect,
    signal,
} from '@angular/core';
import { ViewDidEnter, ViewDidLeave } from '@ionic/angular';
import { MovingObjectComponent } from 'src/app/components/moving-object/moving-object.component';

enum InteractableObject {
    BALLOON = 'balloon',
}

const interactionSounds: { [key: string]: { [key: number]: string } } = {
    [InteractableObject.BALLOON]: {
        0: '../../../assets/sounds/pop0.mp3',
        1: '../../../assets/sounds/pop1.mp3',
        2: '../../../assets/sounds/pop2.mp3',
    },
};

enum Bgm {
    JAZZ_TRIO,
    JAZZ_HAPPY,
    JAZZ_SWING,
}

const bgms: { [key: string]: string } = {
    [Bgm.JAZZ_TRIO]: '../../../assets/sounds/jazz-trio.mp3',
    [Bgm.JAZZ_HAPPY]: '../../../assets/sounds/jazz-happy.mp3',
    [Bgm.JAZZ_SWING]: '../../../assets/sounds/jazz-swing.mp3',
};

const bgmArr = [
    bgms[Bgm.JAZZ_TRIO],
    bgms[Bgm.JAZZ_HAPPY],
    bgms[Bgm.JAZZ_SWING],
];

const startingBgmSongIndex = Math.floor(Math.random() * bgmArr.length);

function generateRandomBalloon(index: number): LevelObjectConfig {
    const [minSize, maxSize] = [0.7, 0.9];
    const [minStep, maxStep] = [0.4, 1.2];
    const size = Math.max(Math.random() * maxSize, minSize);
    const diff = maxSize - minSize;
    const indicator = diff / 4;
    let sizeGroup = 2;
    if (size > minSize + indicator / 2) {
        if (size < maxSize - indicator / 2) {
            sizeGroup = 1;
        } else {
            sizeGroup = 0;
        }
    }

    return {
        attrs: {
            id: window.crypto.getRandomValues(new Uint8Array(10)).join(''),
            name: InteractableObject.BALLOON,
            isActive: true,
            basePoints: 10,
            sizeGroup,
        },
        movement: {
            index,
            size: { width: size, height: size + 0.2 },
            step: Math.max(Math.random() * maxStep, minStep),
            startPos: null,
        },
    };
}

const generateNewItems = (count = 5) => {
    return new Array(count)
        .fill(0)
        .map((_, i: number) => generateRandomBalloon(i));
};

const numBalloons = 2;

@Component({
    selector: 'app-play',
    templateUrl: './play.page.html',
    styleUrl: './play.page.scss',
    standalone: true,
    imports: [MovingObjectComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayPage implements ViewDidLeave, ViewDidEnter {
    levelObjects = signal<LevelObjectConfig[]>(generateNewItems(numBalloons));
    score = signal<number>(0);
    currentTouch = signal<[number, number]>([0, 0]);
    bgmSongIndex = signal<number>(-1);
    bgmInterval!: any;
    bounds = signal<Bounds>(this.windowBounds);
    computed = signal<number>(3);
    isThrottled = signal(false);

    bgmSong!: HTMLAudioElement;
    interactionSound!: HTMLAudioElement;

    constructor() {
        effect(this.playBgmAudio.bind(this));
    }

    @HostListener('window:resize')
    handleScreenOrientationChange() {
        this.setBounds();
        this.initializeLevelObjects();
    }

    setBounds() {
        this.bounds.set(this.windowBounds);
    }

    get windowBounds(): Bounds {
        return {
            width: [0, window.innerWidth],
            height: [0, window.innerHeight],
        };
    }

    initializeLevelObjects() {
        this.levelObjects.set(generateNewItems(numBalloons));
    }

    isEveryObjectInactive(levelObjects: LevelObjectConfig[]) {
        return levelObjects.every((lo) => !lo.attrs.isActive);
    }

    ionViewDidEnter() {
        if (this.bgmSongIndex() !== -1) return;
        this.bgmSongIndex.set(startingBgmSongIndex);
    }

    ionViewDidLeave() {
        this.bgmSong.pause();
        this.bgmSong.removeEventListener(
            'ended',
            this.incrementBgmSong.bind(this),
        );
        this.bgmSongIndex.set(-1);
    }

    touchPage(event: TouchEvent) {
        const { pageX, pageY } = event.changedTouches[0];
        this.currentTouch.set([pageX, pageY]);
    }

    clickPage(event: MouseEvent) {
        this.currentTouch.set([event.x, event.y]);
    }

    playBgmAudio() {
        clearInterval(this.bgmInterval);
        this.bgmSong = new Audio(bgmArr[this.bgmSongIndex()]);
        if (!navigator.userActivation.hasBeenActive) {
            this.bgmInterval = setInterval(() => {
                if (navigator.userActivation.hasBeenActive) {
                    clearInterval(this.bgmInterval);
                    this.bgmSong.play();
                }
            }, 16);
        } else {
            this.bgmSong.play();
        }
        this.bgmSong.addEventListener('ended', () => {
            this.incrementBgmSong();
        });
    }

    @HostListener('document:visibilitychange', [
        '$event.target.visibilityState',
    ])
    toggleBgmAudio(visibilityState: 'visible' | 'hidden') {
        if (visibilityState === 'hidden') {
            this.bgmSong.pause();
        }
        if (visibilityState === 'visible') {
            this.playBgmAudio();
        }
    }

    playInteractionAudio(soundName: string, size: number) {
        if (this.interactionSound?.duration > 0) {
            this.interactionSound.pause();
        }
        this.interactionSound = new Audio(interactionSounds[soundName][size]);
        this.interactionSound.play();
    }

    playInflateAudio() {
        const inflateSound = new Audio('../../../assets/sounds/inflate.mp3');
        inflateSound.play();
        inflateSound.playbackRate = 4;
    }

    batchedInteractions: ObjectUpdate[] = [];

    interactionEvent(objConfig: ObjectUpdate) {
        if (this.isThrottled()) return;
        this.batchedInteractions.push(objConfig);
        this.disableReenableInteractions();
        window.setTimeout(this.updateObjects.bind(this), 10);
    }

    disableReenableInteractions() {
        window.setTimeout(() => {
            this.isThrottled.set(true);
            window.setTimeout(() => this.isThrottled.set(false), 200);
        }, 5);
    }

    updateObjects() {
        if (!this.batchedInteractions.length) return;
        const objConfig =
            this.batchedInteractions[this.batchedInteractions.length - 1];
        const updatedObjects = this.createUpdatedLevelObjects(objConfig);
        if (this.isEveryObjectInactive(updatedObjects)) {
            this.incrementLevel(updatedObjects);
        } else {
            this.levelObjects.set(updatedObjects);
        }
        this.playInteractionAudio(objConfig.name, objConfig.sizeGroup);
        this.updateScore(objConfig);
        this.batchedInteractions = [];
    }

    incrementLevel(levelObjects: LevelObjectConfig[]) {
        const newLevelObjects = generateNewItems(numBalloons);
        if (levelObjects.length >= 20) {
            this.levelObjects.set(newLevelObjects);
        }
        this.levelObjects.set([...levelObjects, ...newLevelObjects]);
    }

    updateScore(event: ObjectUpdate) {
        this.score.update((currentScore: number) => {
            return Math.round(
                currentScore + event.basePoints / event.size.width,
            );
        });
    }

    createUpdatedLevelObjects(
        loConfig: Partial<AttrConfig>,
    ): LevelObjectConfig[] {
        return structuredClone(this.levelObjects()).reduce(
            (acc: LevelObjectConfig[], curr: LevelObjectConfig) => {
                if (curr.attrs.id === loConfig.id) {
                    curr.attrs.isActive = false;
                }
                return [...acc, curr];
            },
            [],
        );
    }

    incrementBgmSong(): void {
        if (this.bgmSongIndex() >= bgmArr.length - 1) {
            this.bgmSongIndex.set(0);
        } else {
            this.bgmSongIndex.update((i: number) => i + 1);
        }
    }
}

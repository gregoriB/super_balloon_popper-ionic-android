import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    HostListener,
    OnDestroy,
    effect,
    signal,
} from '@angular/core';
import { MovingObjectComponent } from 'src/app/components/moving-object/moving-object.component';

interface LevelObjectConfig {
    obj: ObjectConfig;
    movement: MovementConfig;
}

interface ObjectUpdate {
    id: ObjectConfig['id'];
    basePoints: ObjectConfig['basePoints'];
    size: MovementConfig['size'];
    name: string;
}

const colors = [
    'aqua',
    'chartreuse',
    'cyan',
    'greenyellow',
    'hotpink',
    'lime',
    'magenta',
    'orange',
    'yellow',
    'red',
    'blue',
    'springgreen',
    'violet',
];

enum InteractableObject {
    BALLOON = 'balloon',
}

const interactionSounds: { [key: string]: string } = {
    [InteractableObject.BALLOON]: '../../../assets/sounds/pop.flac',
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

function generateRandomBalloon(colors: string[]): LevelObjectConfig {
    const [minSize, maxSize] = [0.8, 1.1];
    // const [minStep, maxStep] = [0.03, 0.08];
    const [minStep, maxStep] = [0.1, 0.6];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    return {
        obj: {
            id: window.crypto.getRandomValues(new Uint8Array(10)).join(''),
            name: InteractableObject.BALLOON,
            style: {
                backgroundColor: randomColor,
            },
            isActive: true,
            basePoints: 10,
        },
        movement: {
            size: Math.max(Math.random() * maxSize, minSize),
            step: Math.max(Math.random() * maxStep, minStep),
            startPos: null,
        },
    };
}

const generateNewItems = (count = 5) => {
    return new Array(count).fill(0).map(() => generateRandomBalloon(colors));
};

const numBalloons = 2;

@Component({
    selector: 'app-play',
    templateUrl: './play.page.html',
    styleUrl: './play.page.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MovingObjectComponent],
})
export class PlayPage implements AfterViewInit, OnDestroy {
    levelObjects = signal<LevelObjectConfig[]>(generateNewItems(numBalloons));
    score = signal<number>(0);
    currentTouch = signal<[number, number]>([0, 0]);
    bgmSongIndex = signal<number>(0);
    bounds = signal<Bounds>(this.windowBounds);
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
        width: [0, screen.availWidth],
        height: [0, screen.availHeight]
      }
    }

    initializeLevelObjects() {
      this.levelObjects.set(generateNewItems(numBalloons));
    }

    isEveryObjectInactive(levelObjects: LevelObjectConfig[]) {
        return levelObjects.every((lo) => !lo.obj.isActive);
    }

    ngAfterViewInit() {
        this.bgmSongIndex.set(startingBgmSongIndex);
    }

    ngOnDestroy() {
        this.bgmSong.pause();
        this.bgmSong.removeEventListener(
            'ended',
            this.incrementBgmSong.bind(this),
        );
    }

    touchPage(event: TouchEvent) {
        const { pageX, pageY } = event.changedTouches[0];
        this.currentTouch.set([pageX, pageY]);
    }

    clickPage(event: MouseEvent) {
        this.currentTouch.set([event.x, event.y]);
    }

    playBgmAudio() {
        this.bgmSong = new Audio(bgmArr[this.bgmSongIndex()]);
        this.bgmSong.play();
        this.bgmSong.addEventListener(
            'ended',
            this.incrementBgmSong.bind(this),
        );
    }

    playInteractionAudio(soundName: string) {
        if (this.interactionSound?.duration > 0) {
            this.interactionSound.pause();
        }
        this.interactionSound = new Audio(interactionSounds[soundName]);
        this.interactionSound.play();
    }

    playInflateAudio() {
        const inflateSound = new Audio('../../../assets/sounds/inflate.flac');
        inflateSound.play();
        inflateSound.playbackRate = 4;
    }

    interactionEvent(objConfig: ObjectUpdate) {
        if (this.isThrottled()) return;
        this.isThrottled.set(true)
        window.setTimeout(() => (this.isThrottled.set(false)), 200)
        const updatedObjects = this.createUpdatedLevelObjects(objConfig);
        if (this.isEveryObjectInactive(updatedObjects)) {
            this.incrementLevel(updatedObjects);
        } else {
            this.levelObjects.set(updatedObjects);
        }
        this.playInteractionAudio(objConfig.name);
        this.updateScore(objConfig);
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
            return Math.round(currentScore + event.basePoints / event.size);
        });
    }

    createUpdatedLevelObjects(
        loConfig: Partial<ObjectConfig>,
    ): LevelObjectConfig[] {
        return structuredClone(this.levelObjects()).reduce(
            (acc: LevelObjectConfig[], curr: LevelObjectConfig) => {
                if (curr.obj.id === loConfig.id) {
                    curr.obj.isActive = false;
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

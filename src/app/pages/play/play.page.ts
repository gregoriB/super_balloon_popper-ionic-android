import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    Signal,
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

function generateRandomBalloon(): LevelObjectConfig {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.min(Math.random() * 1, 0.9);
    const step = Math.max(Math.random() * 0.08, 0.03);
    const uint8array = new Uint8Array(10);
    const id = window.crypto.getRandomValues(uint8array);

    return {
        obj: {
            id: id.join(''),
            name: 'balloon',
            style: { backgroundColor: color },
            isActive: true,
            basePoints: 10,
        },
        movement: {
            size,
            step,
            startPos: null,
        },
    };
}

const generateNewItems = (count = 5) => {
    return new Array(count).fill(0).map(() => generateRandomBalloon());
};

const numBalloons = 3;

const JAZZ_TRIO = '../../../assets/sounds/jazz-trio.mp3';
const JAZZ_HAPPY = '../../../assets/sounds/jazz-happy.mp3';
const JAZZ_SWING = '../../../assets/sounds/swing.mp3';
const bgm = [JAZZ_TRIO, JAZZ_HAPPY, JAZZ_SWING];
const startingSongIndex = Math.floor(Math.random() * bgm.length);

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
    songIndex = signal(0);
    song!: HTMLAudioElement;

    constructor() {
        effect(this.playAudio.bind(this));
    }

    get isEveryObjectInactive() {
        return this.levelObjects().every(
            (lo: LevelObjectConfig) => !lo.obj.isActive,
        );
    }

    ngAfterViewInit() {
        this.songIndex.set(startingSongIndex);
    }

    playAudio() {
        this.song = new Audio(bgm[this.songIndex()]);
        this.song.play();
        this.song.addEventListener('ended', this.incrementSong.bind(this));
    }

    ngOnDestroy() {
        this.song.pause();
        this.song.removeEventListener('ended', this.incrementSong.bind(this));
    }

    interactionEvent(event: ObjectUpdate) {
        this.levelObjects.update(this.createUpdatedLevelObjects(event));
        this.updateScore(event);
        if (this.isEveryObjectInactive) {
            this.levelObjects.set(generateNewItems(numBalloons));
        }
    }

    updateScore(event: ObjectUpdate) {
        this.score.update((currentScore: number) => {
            return Math.round(currentScore + event.basePoints / event.size);
        });
    }

    createUpdatedLevelObjects(
        event: Partial<ObjectConfig>,
    ): (levelObjects: LevelObjectConfig[]) => LevelObjectConfig[] {
        return (levelObjects: LevelObjectConfig[]): LevelObjectConfig[] =>
            structuredClone(levelObjects).reduce(
                (acc: LevelObjectConfig[], curr: LevelObjectConfig) => {
                    if (curr.obj.id === event.id) {
                        curr.obj.isActive = false;
                    }
                    return [...acc, curr];
                },
                [],
            );
    }

    incrementSong(): void {
        if (this.songIndex() >= bgm.length - 1) {
            this.songIndex.set(0);
        } else {
            this.songIndex.update((i: number) => i + 1);
        }
    }
}

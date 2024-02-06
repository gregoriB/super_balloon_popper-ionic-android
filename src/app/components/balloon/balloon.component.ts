import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    Input,
    OnChanges,
    SimpleChanges,
    computed,
    signal,
} from '@angular/core';

const colors = [
    'blue',
    'red',
    'green',
    'yellow',
    'orange',
    'purple',
    'pink',
] as const;

@Component({
    selector: 'app-balloon',
    templateUrl: './balloon.component.html',
    styleUrls: ['./balloon.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BalloonComponent implements AfterViewInit, OnChanges {
    @Input({ required: true }) config!: AttrConfig;

    selectedColor = colors[this.getRandom(colors.length)];
    saturation = this.getRandom(50, 100);
    contrast = this.getRandom(20, 100);
    brightness = this.getRandom(20, 100);
    rotation = signal(0);
    direction = Math.random() > 0.5 ? .3 : -0.3;
    rotationLimit = this.getRandom(30, 5);
    interval: number = 0;
    style = computed(() => ({
        transform: `rotate(${this.rotation()}deg)`,
        backgroundImage: `url('../../../assets/images/${this.selectedColor}@2x.svg')`,
        filter: `
          saturate(${this.saturation}%)
          contrast(${this.contrast}%)
          brightness(${this.brightness}%)
        `,
    }));

    ngAfterViewInit() {
        this.setRotation();
    }


    setRotation() {
        this.interval = window.setInterval(() => {
            if (this.direction < 0) {
                if (this.rotation() < this.rotationLimit * -1) {
                  this.direction *= -1;
                }
            } else if (this.direction > 0) {
              if (this.rotation() > this.rotationLimit) {
                  this.direction *= -1;
              }
            }
            this.rotation.update((r: number) => r + this.direction);
        }, 16);
    }

    ngOnChanges(changes: SimpleChanges) {
        const currentConfig = changes['config']?.currentValue as AttrConfig;
        if (!currentConfig.isActive) {
            window.clearTimeout(this.interval);
            this.interval = 0;
        }
    }

    getRandom(max: number, min = 0): number {
        return Math.floor(Math.random() * max) + min;
    }
}

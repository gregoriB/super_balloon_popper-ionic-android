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
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
})
export class BalloonComponent implements AfterViewInit, OnChanges {
    @Input({ required: true }) config!: AttrConfig;

    selectedColor = colors[Math.floor(Math.random() * colors.length)];
    saturation = Math.floor(Math.random() * 50) + 100;
    contrast = Math.floor(Math.random() * 20) + 100;
    brightness = Math.floor(Math.random() * 20) + 100;
    rotation = signal(0);
    direction = Math.random() > 0.5 ? 1 : -1;
    rotationAmount = Math.floor(Math.random() * 30) + 5;
    interval: number = 0;
    style = computed(() => ({
        transform: `rotate(${this.rotation()}deg)`,
        backgroundImage: `url('../../../assets/images/${this.selectedColor}@2x.svg')`,
        filter: `saturate(${this.saturation}%) contrast(${this.contrast}%) brightness(${this.brightness}%)`,
    }));

    ngAfterViewInit() {
        const speed = 1000 / this.rotationAmount;
        this.interval = window.setInterval(() => {
            if (Math.abs(this.rotation()) === this.rotationAmount) {
                this.direction = this.direction * -1;
            }
            this.rotation.update((rot: number) => rot + this.direction);
        }, speed);
    }

    ngOnChanges(changes: SimpleChanges) {
        const currentConfig = changes['config']?.currentValue as AttrConfig;
        if (!currentConfig.isActive) {
            window.clearTimeout(this.interval);
            this.interval = 0;
        }
    }
}

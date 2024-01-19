import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    Signal,
    signal,
} from '@angular/core';
import { BalloonComponent } from '../balloon/balloon.component';
import { CommonModule } from '@angular/common';

interface Style {
    left: string;
    top: string;
    width: string;
    height: string;
    [key: string]: string;
}

@Component({
    selector: 'app-moving-object',
    templateUrl: './moving-object.component.html',
    styleUrls: ['./moving-object.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [BalloonComponent, CommonModule],
})
export class MovingObjectComponent implements OnInit, OnDestroy {
    @Input({ required: true }) movementConfig!: MovementConfig;
    @Input({ required: true }) objectConfig!: ObjectConfig;
    @Output() interactionEvent = new EventEmitter();

    objPos = signal<[number, number]>([0, 0]);
    objBearing = signal<[number, number]>([this.flipCoin(), this.flipCoin()]);
    windowSize = signal<[number, number]>([
        window.innerWidth,
        window.innerHeight,
    ]);
    movementInterval: number = 0;

    get random(): number {
        return Math.random();
    }

    get randomPos(): [number, number] {
        return [
            this.random * this.windowSize()[0] * this.movementConfig.size,
            this.random * this.windowSize()[1] * this.movementConfig.size,
        ];
    }

    get size(): { width: number; height: number } {
        return {
            width: this.windowSize()[0] * this.movementConfig.size,
            height: this.windowSize()[0] * this.movementConfig.size,
        };
    }

    get styleConfig(): Style {
        const [X, Y] = this.objPos();
        const { width, height } = this.size;
        return {
            left: X + 'px',
            top: Y + 'px',
            width: width + 'px',
            height: height + 'px',
        };
    }

    generateRandomNumber(min: number, max: number): number {
        return this.random * (max - min) + min;
    }

    flipCoin(): number {
        return this.random > 0.5
            ? this.generateRandomNumber(0.1, 0.5)
            : -this.generateRandomNumber(0.1, 0.5);
    }

    generateUpdatedPos(pos: number[], bearing: number[]): [number, number] {
        const step = this.movementConfig.step;
        const [pX, pY] = pos;
        const [bX, bY] = bearing;
        const sX = bX < 0 ? -step : step;
        const sY = bY < 0 ? -step : step;
        return [pX + sX, pY + sY];
    }

    generateUpdatedBearing(): [number, number] {
        const pos = this.objPos();
        const bearing = this.objBearing();
        let [wX, wY] = this.windowSize();
        let newBearingX = bearing[0];
        let newBearingY = bearing[1];
        const [pX, pY] = this.generateUpdatedPos(pos, bearing);
        const { width, height } = this.size;
        if (pX <= 1 || pX + width >= wX) {
            newBearingX = newBearingX * -1;
        }
        if (pY <= 1 || pY + height >= wY) {
            newBearingY = newBearingY * -1;
        }
        return [newBearingX, newBearingY];
    }

    moveObject(): void {
        const newBearing = this.generateUpdatedBearing();
        const newPos = this.generateUpdatedPos(this.objPos(), newBearing);
        this.objPos.set(newPos);
        this.objBearing.set(newBearing);
    }

    ngOnInit() {
        const startPos = this.movementConfig.startPos || this.randomPos;
        this.objPos = signal(startPos);
        this.movementInterval = window.setInterval(() => this.moveObject(), 1);
    }

    ngOnDestroy() {
        console.log('destroyed', this.objectConfig.id);
        clearInterval(this.movementInterval);
        this.movementInterval = 0;
    }

    onClick(event: unknown) {
        this.interactionEvent.emit({
            id: this.objectConfig.id,
            basePoints: this.objectConfig.basePoints,
            size: this.movementConfig.size,
        });
    }

    debugLog(event: unknown) {
        const isClickEvent = (e: any): e is MouseEvent => {
            return !isNaN(e?.y) && !isNaN(e?.x);
        };
        if (isClickEvent(event)) {
            console.log(
                'X: ',
                Math.round(this.objPos()[0]) +
                    ' to ' +
                    (Math.round(this.objPos()[0]) + this.size.width),
                event.x,
            );

            console.log(
                'Y: ',
                Math.round(this.objPos()[1]) +
                    ' to ' +
                    (Math.round(this.objPos()[1]) + this.size.width),
                event.y,
            );

            console.log(
                'width: ',
                Math.round(
                    this.objPos()[0] + this.size.width - this.objPos()[0],
                ),
            );
        }
    }
}

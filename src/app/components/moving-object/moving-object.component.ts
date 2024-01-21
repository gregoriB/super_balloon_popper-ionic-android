import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
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
export class MovingObjectComponent implements OnInit, OnDestroy, OnChanges {
    @Input({ required: true }) movementConfig!: MovementConfig;
    @Input({ required: true }) objectConfig!: ObjectConfig;
    @Input({ required: true }) currentTouch!: [number, number];
    @Output() interactionEvent = new EventEmitter();

    objPos = signal<[number, number]>([0, 0]);
    objBearing = signal<[number, number]>([this.flipCoin(), this.flipCoin()]);
    windowSize = signal<[number, number]>([
        window.innerWidth,
        window.innerHeight,
    ]);
    movementInterval: number = 0;
    isDestroyed = false;

    ngOnChanges(simpleChanges: SimpleChanges): void {
        const currentValue = simpleChanges['currentTouch']?.currentValue;
        const previousValue = simpleChanges['currentTouch']?.previousValue;
        if (!previousValue || !currentValue) {
            return;
        }
        const [oldX, oldY] = previousValue;
        const [newX, newY] = currentValue;
        const isCurrentTouchUpdated = oldX !== newX || oldY !== newY;
        if (!isCurrentTouchUpdated) {
            return;
        }
        if (this.isTouchInObject) {
            this.onInteract();
        }
    }

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

    get isTouchInObject(): boolean {
        const { width: objectW, height: objectH } = this.size;
        const [cX, cY] = this.currentTouch;
        const [pX, pY] = this.objPos();
        const [eX, eY] = [pX + objectW, pY + objectH];
        const isX = cX > pX && cX < eX;
        const isY = cY > pY && cY < eY;
        return isX && isY;
    }

    generateRandomNumber(min: number, max: number): number {
        return this.random * (max - min) + min;
    }

    flipCoin(): number {
        // Use Math.random here since we always need it to return < 1
        const multiplier = Math.round(Math.random()) || -1;
        return this.generateRandomNumber(0.1, 0.5) * multiplier;
    }

    generateUpdatedPos(pos: number[], bearing: number[]): [number, number] {
        const [posX, posY] = pos;
        const [bearingX, bearingY] = bearing;
        const step = this.movementConfig.step;
        const stepX = bearingX < 0 ? -step : step;
        const stepY = bearingY < 0 ? -step : step;
        return [posX + stepX, posY + stepY];
    }

    generateUpdatedBearing(): [number, number] {
        const [bX, bY] = this.objBearing();
        const [windowW, windowH] = this.windowSize();
        const [pX, pY] = this.generateUpdatedPos(this.objPos(), [bX, bY]);
        const { width, height } = this.size;
        return [
            pX <= 1 || pX + width >= windowW ? bX * -1 : bX,
            pY <= 1 || pY + height >= windowH ? bY * -1 : bY,
        ];
    }

    moveObject(): void {
        const newBearing = this.generateUpdatedBearing();
        const newPos = this.generateUpdatedPos(this.objPos(), newBearing);
        this.objPos.set(newPos);
        this.objBearing.set(newBearing);
    }

    ngOnInit(): void {
        const startPos = this.movementConfig.startPos || this.randomPos;
        this.objPos = signal(startPos);
        this.movementInterval = window.setInterval(() => this.moveObject(), 1);
    }

    ngOnDestroy(): void {
        clearInterval(this.movementInterval);
        this.movementInterval = 0;
    }

    onInteract(): void {
        if (this.isDestroyed) return;
        this.isDestroyed = true;
        this.interactionEvent.emit({
            id: this.objectConfig.id,
            basePoints: this.objectConfig.basePoints,
            size: this.movementConfig.size,
            name: this.objectConfig.name,
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

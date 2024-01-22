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
    @Input({ required: true }) isThrottled!: boolean;
    @Input({ required: true }) bounds!: Bounds;
    @Input({ required: true }) movementConfig!: MovementConfig;
    @Input({ required: true }) objectConfig!: AttrConfig;
    @Input({ required: true }) currentTouch!: [number, number];
    @Output() interactionEvent = new EventEmitter();

    objPos = signal<[number, number]>([0, 0]);
    objBearing = signal<[number, number]>([this.flipCoin(), this.flipCoin()]);
    movementInterval: number = 0;

    ngOnChanges(changes: SimpleChanges): void {
        const currentTouch = changes['currentTouch']?.currentValue;
        const previousTouch = changes['currentTouch']?.previousValue;
        if (previousTouch && currentTouch) {
            this.handleCurrentTouchChange(previousTouch, currentTouch);
        }
        const currentConfig = changes['objectConfig']?.currentValue;
        if (currentConfig) {
            this.handleActiveStateChange(currentConfig.isActive);
        }
    }

    handleCurrentTouchChange(
        previousTouch: [number, number],
        currentTouch: [number, number],
    ) {
        const [oldX, oldY] = previousTouch;
        const [newX, newY] = currentTouch;
        const isCurrentTouchUpdated = oldX !== newX || oldY !== newY;
        if (!isCurrentTouchUpdated) {
            return;
        }
        if (this.isTouchInObject) {
            this.onInteract();
        }
    }

    handleActiveStateChange(isActive: boolean) {
        if (isActive) {
            return;
        }
        this.stopMovement();
    }

    get random(): number {
        return Math.random();
    }

    get randomPos(): [number, number] {
        const pos: [number, number] = [
            this.random * this.bounds.width[1],
            this.random * this.bounds.height[1],
        ];

        // should be negative
        const diffX = pos[0] + this.size.width - this.bounds.width[1];
        const diffY = pos[1] + this.size.height - this.bounds.height[1];
        pos[0] = diffX >= 0 ? pos[0] - diffX : pos[0];
        pos[1] = diffY >= 0 ? pos[1] - diffY : pos[1];

        return pos;
    }

    get size(): { width: number; height: number } {
        const multiplier = Math.min(
            this.bounds.width[1],
            this.bounds.height[1],
        );
        return {
            width: multiplier * this.movementConfig.size.width,
            height: multiplier * this.movementConfig.size.height,
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
        if (this.isThrottled) {
            return false;
        }
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
        const { width: bWidth, height: bHeight } = this.bounds;
        const [pX, pY] = this.generateUpdatedPos(this.objPos(), [bX, bY]);
        const { width: sWidth, height: wHeight } = this.size;
        return [
            pX <= bWidth[0] || pX + sWidth >= bWidth[1] ? bX * -1 : bX,
            pY <= bWidth[0] || pY + wHeight >= bHeight[1] ? bY * -1 : bY,
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
        this.stopMovement();
    }

    stopMovement(): void {
        clearInterval(this.movementInterval);
        this.movementInterval = 0;
    }

    onInteract(): void {
        if (!this.objectConfig.isActive) return;
        this.interactionEvent.emit({
            id: this.objectConfig.id,
            basePoints: this.objectConfig.basePoints,
            size: this.movementConfig.size,
            name: this.objectConfig.name,
            index: this.movementConfig.index,
        });
    }
}

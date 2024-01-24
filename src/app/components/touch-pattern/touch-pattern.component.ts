import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnInit,
} from '@angular/core';

@Component({
    selector: 'app-touch-pattern',
    templateUrl: './touch-pattern.component.html',
    styleUrls: ['./touch-pattern.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TouchPatternComponent {
    @Input({ required: true }) count!: number;
    @Input({ required: true }) maxCount!: number;

    get countTexts() {
        if (this.count === this.maxCount - 1) {
            return ['Click the back button', 'times to exit'];
        }
        if (this.count === 1) {
            return ['Click the back button', 'more time to exit'];
        }
        return ['Click the back button', 'more times to exit'];
    }
}

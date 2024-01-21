import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-balloon',
    templateUrl: './balloon.component.html',
    styleUrls: ['./balloon.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
})
export class BalloonComponent {
    @Input({ required: true }) config!: ObjectConfig;
}

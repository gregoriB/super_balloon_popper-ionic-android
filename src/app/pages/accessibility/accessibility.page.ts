import {
    ChangeDetectionStrategy,
    Component,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { Settings } from 'capacitor-settings';

@Component({
    selector: 'app-accessibility',
    templateUrl: './accessibility.page.html',
    styleUrls: ['./accessibility.page.scss'],
    imports: [RouterModule],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessibilityPage {
    handleAccessibilityClick() {
        Settings.openAccessibilitySettings();
    }
}

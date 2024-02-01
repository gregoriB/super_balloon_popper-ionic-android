import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Settings } from 'capacitor-settings';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
    selector: 'app-accessibility',
    templateUrl: './accessibility.page.html',
    styleUrls: ['./accessibility.page.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessibilityPage {
    private navigation = inject(NavigationService);
    handleAccessibilityClick() {
        Settings.openAccessibilitySettings();
    }

    proceedToNextPage() {
        this.navigation.proceedFrom(Pages.ACCESSIBILITY_PAGE);
    }
}

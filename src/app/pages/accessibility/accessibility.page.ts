import { NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    signal,
} from '@angular/core';
import { ViewDidLeave } from '@ionic/angular';
import { Settings } from 'capacitor-settings';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
    selector: 'app-accessibility',
    templateUrl: './accessibility.page.html',
    styleUrls: ['./accessibility.page.scss'],
    standalone: true,
    imports: [NgIf],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessibilityPage implements ViewDidLeave {
    private navigation = inject(NavigationService);
    isLoading = signal(false);

    handleAccessibilityClick() {
        Settings.openAccessibilitySettings();
    }

    proceedToNextStep() {
        this.isLoading.set(true);
        this.navigation.proceedToNextStep();
    }

    ionViewDidLeave() {
        this.isLoading.set(false);
    }
}

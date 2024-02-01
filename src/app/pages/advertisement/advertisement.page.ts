import { Location, PlatformLocation } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    inject,
} from '@angular/core';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
    selector: 'app-advertisement',
    templateUrl: './advertisement.page.html',
    styleUrls: ['./advertisement.page.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvertisementPage {
    private navigation = inject(NavigationService);

    proceedToNextStep() {
        this.navigation.proceedFrom(Pages.ADVERTISEMENT_PAGE);
    }
}

import { LocationStrategy } from '@angular/common';
import {
    Attribute,
    Directive,
    ElementRef,
    HostListener,
    Input,
    OnDestroy,
    Renderer2,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLinkWithHref } from '@angular/router';
import { SubscriptionLike, first, timer } from 'rxjs';

@Directive({
    selector: '[routerLinkDelay]',
    standalone: true,
})
export class NavigationDelayDirective
    extends RouterLinkWithHref
    implements OnDestroy
{
    @Input({ required: true }) delay!: number;

    private timer$!: SubscriptionLike;

    constructor(
        router: Router,
        route: ActivatedRoute,
        renderer: Renderer2,
        @Attribute('tabindex') tabIndexAttribute: string | null | undefined,
        el: ElementRef,
        locationStrategy?: LocationStrategy,
    ) {
        super(router, route, tabIndexAttribute, renderer, el, locationStrategy);
    }

    @Input()
    set link(commands: any[] | string) {
        this.routerLink = commands;
    }

    @HostListener('click', [
        '$event.button',
        '$event.ctrlKey',
        '$event.shiftKey',
        '$event.altKey',
        '$event.metaKey',
    ])

    // @ts-ignore
    onClick(
        button: number,
        ctrlKey: boolean,
        shiftKey: boolean,
        altKey: boolean,
        metaKey: boolean,
    ): boolean {
        this.timer$ = timer(this.delay)
            .pipe(first())
            .subscribe(() => {
                this.routerLink = 'play';
                super.onClick(button, ctrlKey, shiftKey, altKey, metaKey);
            });
        return false;
    }

    // @ts-ignore
    ngOnDestroy() {
        super.ngOnDestroy();
        this.timer$?.unsubscribe();
    }
}

declare interface MovementConfig {
    index: number;
    size: { width: number; height: number };
    step: number;
    startPos: [number, number] | null;
}

declare interface AttrConfig {
    name: string;
    id: string;
    isActive: boolean;
    basePoints: number;
}

declare interface Bounds {
    width: [number, number];
    height: [number, number];
}

declare interface LevelObjectConfig {
    attrs: AttrConfig;
    movement: MovementConfig;
}

declare interface ObjectUpdate {
    id: AttrConfig['id'];
    basePoints: AttrConfig['basePoints'];
    size: MovementConfig['size'];
    name: string;
    index: number;
}

declare enum InteractableObject {
    BALLOON = 'balloon',
}

declare const enum Pages {
    ADVERTISEMENT_PAGE = 'advertisement',
    ACCESSIBILITY_PAGE = 'accessibility',
    MENU_PAGE = 'menu',
    PLAY_PAGE = 'play',
    APP_PAGE = 'app',
}

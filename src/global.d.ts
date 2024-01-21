declare interface MovementConfig {
    size: number;
    step: number;
    startPos: [number, number] | null;
}

declare interface ObjectConfig {
    name: string;
    id: string | number;
    isActive: boolean;
    style?: {
        backgroundColor: string;
    };
    basePoints: number;
}

interface Bounds {
  width: [number, number];
  height: [number, number];
}


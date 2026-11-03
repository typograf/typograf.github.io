export interface RippleWave {
    id: number;
    x: number;
    y: number;
    size: number;
    durationMs: number;
}

export interface RippleProps {
    waves: RippleWave[];
}

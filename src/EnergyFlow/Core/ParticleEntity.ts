export interface Coordinate {
    x: number;
    y: number;
}

export default class ParticleEntity {
    public position: Coordinate = {x: 0, y: 0};
    public velocity: Coordinate = {x: 0, y: 0};
    public source?: number;
    public target?: number;
    public progress: number = 0;
    public progressBefore: number = 0;
}

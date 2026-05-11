export interface Coordinate {
    x: number;
    y: number;
}

export default class ParticleEntity {
    public position: Coordinate = {x: 0, y: 0};
    public source?: number;
    public target?: number;
    public trajectory: Array<Coordinate> = [];
    public trajectoryLength: number = 0;
    public trajectoryProgress: number = 0;
}

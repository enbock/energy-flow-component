export class ParticleModel {
    public x: number = 0;
    public y: number = 0;
    public connectionIndex: number = 0;
}

export default class EnergyFlowModel {
    public particles: ParticleModel[] = [
        {
            x: 0,
            y: 0,
            connectionIndex: 2
        },
        {
            x: -1,
            y: -1,
            connectionIndex: 0
        },
        {
            x: 1,
            y: -1,
            connectionIndex: 0
        },
        {
            x: 1,
            y: 1,
            connectionIndex: 1
        },
        {
            x: -1,
            y: 1,
            connectionIndex: 1
        }
    ];
    public colors: Array<string> = ['rgba(0,0,255,0.25)', 'rgba(255,0,0,0.25)', 'rgba(0,128,0,1)'];
}

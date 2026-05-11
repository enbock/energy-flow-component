export class ParticleModel {
    public x: number = 0;
    public y: number = 0;
    public connectionIndex: number = 0;
    public trajectory: Array<{x: number, y: number}> = [];
}

export default class EnergyFlowModel {
    public particles: Array<ParticleModel> = [
        {x: 0, y: 0, connectionIndex: 2, trajectory: []},
        {x: -1, y: -1, connectionIndex: 0, trajectory: []},
        {x: 1, y: -1, connectionIndex: 0, trajectory: []},
        {x: 1, y: 1, connectionIndex: 1, trajectory: []},
        {x: -1, y: 1, connectionIndex: 1, trajectory: []}
    ];
    public colors: Array<string> = ['rgba(0,0,255,0.25)', 'rgba(255,0,0,0.25)', 'rgba(0,128,0,1)'];
}

import EnergyFlowPresenter from './EnergyFlowPresenter';
import ResponseCollection from '../Controller/ResponseCollection';
import ParticleEntity from '../../Core/ParticleEntity';
import ConnectionEntity from '../../Core/ConnectionUseCase/ConnectionEntity';
import EnergyFlowModel from './EnergyFlowModel';

describe('EnergyFlowPresenter', function (): void {
    let energyFlowPresenter: EnergyFlowPresenter,
        data: ResponseCollection;

    beforeEach(function (): void {
        energyFlowPresenter = new EnergyFlowPresenter();

        data = new ResponseCollection();
    });

    it('should present data and return an EnergyFlowModel', function (): void {
        const particle1: ParticleEntity = new ParticleEntity();
        particle1.source = 5;
        particle1.position = {x: 10, y: 20};

        const particle2: ParticleEntity = new ParticleEntity();
        particle2.source = 3;
        particle2.position = {x: 30, y: 40};

        data.particleResponse.particles = [particle1, particle2];

        const connection1: ConnectionEntity = new ConnectionEntity();
        connection1.color = 'test::color1';

        const connection2: ConnectionEntity = new ConnectionEntity();
        connection2.color = 'test::color2';

        data.connectionResponse.connections = [connection1, connection2];

        const result: EnergyFlowModel = energyFlowPresenter.present(data);

        expect(result.particles.length).toBe(2);
        expect(result.particles[0].connectionIndex).toBe(5);
        expect(result.particles[0].x).toBe(10);
        expect(result.particles[0].y).toBe(20);
        expect(result.particles[1].connectionIndex).toBe(3);
        expect(result.particles[1].x).toBe(30);
        expect(result.particles[1].y).toBe(40);
        expect(result.colors).toEqual(['test::color1', 'test::color2']);
    });
});

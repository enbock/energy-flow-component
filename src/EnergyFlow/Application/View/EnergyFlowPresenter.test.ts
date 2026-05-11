import {describe, it, beforeEach} from 'node:test';
import * as assert from 'node:assert';
import EnergyFlowPresenter from './EnergyFlowPresenter';
import ResponseCollection from '../Controller/ResponseCollection';
import ParticleEntity from '../../Core/ParticleEntity';
import ConnectionEntity from '../../Core/ConnectionUseCase/ConnectionEntity';
import EnergyFlowModel from './EnergyFlowModel';

describe('EnergyFlow.Application.View.EnergyFlowPresenter', function (): void {
    let energyFlowPresenter: EnergyFlowPresenter;
    let data: ResponseCollection;

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

        assert.strictEqual(result.particles.length, 2);
        assert.strictEqual(result.particles[0].connectionIndex, 5);
        assert.strictEqual(result.particles[0].x, 10);
        assert.strictEqual(result.particles[0].y, 20);
        assert.strictEqual(result.particles[1].connectionIndex, 3);
        assert.strictEqual(result.particles[1].x, 30);
        assert.strictEqual(result.particles[1].y, 40);
        assert.deepStrictEqual(result.colors, ['test::color1', 'test::color2']);
    });
});

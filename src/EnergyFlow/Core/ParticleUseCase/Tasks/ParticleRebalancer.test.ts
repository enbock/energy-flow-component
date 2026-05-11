import {describe, it, beforeEach} from 'node:test';
import * as assert from 'node:assert';
import {mock} from '../../../../../test/mock';
import ParticleRebalancer from './ParticleRebalancer';
import ConnectionFinder from './ConnectionFinder';
import TrajectoryCalculator from './TrajectoryCalculator';
import ParticleEntity from '../../ParticleEntity';
import ConnectionEntity from '../../ConnectionUseCase/ConnectionEntity';

describe('EnergyFlow.Core.ParticleUseCase.Tasks.ParticleRebalancer', function (): void {
    let connectionFinder: Mocked<ConnectionFinder>;
    let trajectoryCalculator: Mocked<TrajectoryCalculator>;
    let particleRebalancer: ParticleRebalancer;

    beforeEach(function (): void {
        connectionFinder = mock<ConnectionFinder>();
        trajectoryCalculator = mock<TrajectoryCalculator>();
        particleRebalancer = new ParticleRebalancer(connectionFinder, trajectoryCalculator);
    });

    it('should transfer excess particles from an overloaded source to an under-quota source', function (): void {
        const sourceA: ConnectionEntity = new ConnectionEntity();
        sourceA.value = 1;
        sourceA.x = -1;
        sourceA.y = 0;
        const sourceB: ConnectionEntity = new ConnectionEntity();
        sourceB.value = 1;
        sourceB.x = 1;
        sourceB.y = 0;
        const target: ConnectionEntity = new ConnectionEntity();
        target.value = -2;
        target.x = 0;
        target.y = 1;
        const connections: Array<ConnectionEntity> = [sourceA, sourceB, target];

        const overloaded: ParticleEntity = new ParticleEntity();
        overloaded.source = 0;
        overloaded.target = 2;
        overloaded.position = {x: -0.5, y: 0.5};
        const stayingA: ParticleEntity = new ParticleEntity();
        stayingA.source = 0;
        stayingA.target = 2;
        const stayingB: ParticleEntity = new ParticleEntity();
        stayingB.source = 0;
        stayingB.target = 2;
        const onB: ParticleEntity = new ParticleEntity();
        onB.source = 1;
        onB.target = 2;
        const trajectory: Array<{x: number, y: number}> = [{x: -0.5, y: 0.5}, {x: 0, y: 1}];
        connectionFinder.chooseConnectionIndex.and.returnValue(2);
        trajectoryCalculator.calculateTrajectory.and.returnValue(trajectory);
        trajectoryCalculator.calculateLength.and.returnValue(1);

        particleRebalancer.rebalance(connections, [stayingA, stayingB, overloaded, onB]);

        assert.strictEqual(overloaded.source, 1);
        assert.strictEqual(overloaded.target, 2);
        assert.strictEqual(overloaded.trajectory, trajectory);
        assert.strictEqual(overloaded.trajectoryLength, 1);
        assert.strictEqual(overloaded.trajectoryProgress, 0);
        assert.deepStrictEqual(
            trajectoryCalculator.calculateTrajectory.mock.calls[0].arguments,
            [{x: -0.5, y: 0.5}, {x: 0, y: 1}]
        );
    });
});

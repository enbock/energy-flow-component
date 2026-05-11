import {describe, it, beforeEach} from 'node:test';
import * as assert from 'node:assert';
import {mock} from '../../../../../test/mock';
import ParticleRecycler from './ParticleRecycler';
import ConnectionFinder from './ConnectionFinder';
import TrajectoryCalculator from './TrajectoryCalculator';
import ParticleEntity from '../../ParticleEntity';
import ConnectionEntity from '../../ConnectionUseCase/ConnectionEntity';

describe('EnergyFlow.Core.ParticleUseCase.Tasks.ParticleRecycler', function (): void {
    let connectionFinder: Mocked<ConnectionFinder>;
    let trajectoryCalculator: Mocked<TrajectoryCalculator>;
    let particleRecycler: ParticleRecycler;

    beforeEach(function (): void {
        connectionFinder = mock<ConnectionFinder>();
        trajectoryCalculator = mock<TrajectoryCalculator>();
        particleRecycler = new ParticleRecycler(connectionFinder, trajectoryCalculator);
    });

    it('should reassign arrived particles to a new source and target with a fresh trajectory', function (): void {
        const arrived: ParticleEntity = new ParticleEntity();
        arrived.source = undefined;
        arrived.target = undefined;
        const active: ParticleEntity = new ParticleEntity();
        active.source = 0;
        active.target = 1;
        const source: ConnectionEntity = new ConnectionEntity();
        source.value = 5;
        source.x = -1;
        source.y = 0;
        const target: ConnectionEntity = new ConnectionEntity();
        target.value = -5;
        target.x = 1;
        target.y = 0;
        const connections: Array<ConnectionEntity> = [source, target];
        const trajectory: Array<{x: number, y: number}> = [{x: -1, y: 0}, {x: 1, y: 0}];
        connectionFinder.chooseConnectionIndex.and.callFake(function (
            _connections: Array<ConnectionEntity>,
            positive: boolean
        ): number {
            return positive ? 0 : 1;
        });
        trajectoryCalculator.calculateTrajectory.and.returnValue(trajectory);
        trajectoryCalculator.calculateLength.and.returnValue(2);

        particleRecycler.recycle(connections, [arrived, active]);

        assert.strictEqual(arrived.source, 0);
        assert.strictEqual(arrived.target, 1);
        assert.strictEqual(arrived.trajectory, trajectory);
        assert.strictEqual(arrived.trajectoryLength, 2);
        assert.strictEqual(arrived.trajectoryProgress, 0);
        assert.deepStrictEqual(arrived.position, {x: -1, y: 0});
        assert.strictEqual(active.source, 0);
        assert.strictEqual(active.target, 1);
        assert.strictEqual(active.trajectory.length, 0);
    });
});

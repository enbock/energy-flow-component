import {describe, it, beforeEach} from 'node:test';
import * as assert from 'node:assert';
import {mock} from '../../../../../test/mock';
import ParticleReassigner from './ParticleReassigner';
import ConnectionFinder from './ConnectionFinder';
import TrajectoryCalculator from './TrajectoryCalculator';
import ConnectionEntity from '../../ConnectionUseCase/ConnectionEntity';
import ParticleEntity from '../../ParticleEntity';

describe('EnergyFlow.Core.ParticleUseCase.Tasks.ParticleReassigner', function (): void {
    let connectionFinder: Mocked<ConnectionFinder>;
    let trajectoryCalculator: Mocked<TrajectoryCalculator>;
    let particleReassigner: ParticleReassigner;

    beforeEach(function (): void {
        connectionFinder = mock<ConnectionFinder>();
        trajectoryCalculator = mock<TrajectoryCalculator>();
        particleReassigner = new ParticleReassigner(connectionFinder, trajectoryCalculator);
    });

    it('should keep particles untouched when source and target are still valid', function (): void {
        const source: ConnectionEntity = new ConnectionEntity();
        source.value = 5;
        const target: ConnectionEntity = new ConnectionEntity();
        target.value = -5;
        const particle: ParticleEntity = new ParticleEntity();
        particle.source = 0;
        particle.target = 1;
        particle.trajectoryProgress = 0.5;
        const trajectoryBefore: Array<{x: number, y: number}> = particle.trajectory;

        particleReassigner.reassign([source, target], [particle]);

        assert.strictEqual(particle.source, 0);
        assert.strictEqual(particle.target, 1);
        assert.strictEqual(particle.trajectory, trajectoryBefore);
        assert.strictEqual(particle.trajectoryProgress, 0.5);
        assert.strictEqual(connectionFinder.chooseConnectionIndex.mock.calls.length, 0);
    });

    it('should skip particles that have already arrived', function (): void {
        const particle: ParticleEntity = new ParticleEntity();
        particle.source = undefined;
        particle.target = undefined;

        particleReassigner.reassign([], [particle]);

        assert.strictEqual(connectionFinder.chooseConnectionIndex.mock.calls.length, 0);
    });

    it('should reassign the source while keeping the trajectory when only the source becomes invalid', function (): void {
        const deadSource: ConnectionEntity = new ConnectionEntity();
        deadSource.value = 0;
        const target: ConnectionEntity = new ConnectionEntity();
        target.value = -5;
        const newSource: ConnectionEntity = new ConnectionEntity();
        newSource.value = 3;
        const connections: Array<ConnectionEntity> = [deadSource, target, newSource];
        const particle: ParticleEntity = new ParticleEntity();
        particle.source = 0;
        particle.target = 1;
        particle.position = {x: 0.2, y: 0.3};
        const trajectoryBefore: Array<{x: number, y: number}> = particle.trajectory;
        particle.trajectoryProgress = 0.4;
        connectionFinder.chooseConnectionIndex.and.returnValue(2);

        particleReassigner.reassign(connections, [particle]);

        assert.strictEqual(particle.source, 2);
        assert.strictEqual(particle.target, 1);
        assert.strictEqual(particle.trajectory, trajectoryBefore);
        assert.strictEqual(particle.trajectoryProgress, 0.4);
        assert.deepStrictEqual(
            connectionFinder.chooseConnectionIndex.mock.calls[0].arguments,
            [connections, true]
        );
    });

    it('should reassign target and recompute trajectory from current position when target becomes invalid', function (): void {
        const source: ConnectionEntity = new ConnectionEntity();
        source.value = 5;
        const deadTarget: ConnectionEntity = new ConnectionEntity();
        deadTarget.value = 0;
        const newTarget: ConnectionEntity = new ConnectionEntity();
        newTarget.value = -3;
        newTarget.x = 1;
        newTarget.y = 1;
        const connections: Array<ConnectionEntity> = [source, deadTarget, newTarget];
        const particle: ParticleEntity = new ParticleEntity();
        particle.source = 0;
        particle.target = 1;
        particle.position = {x: 0.2, y: 0.3};
        particle.trajectoryProgress = 0.7;
        const newTrajectory: Array<{x: number, y: number}> = [{x: 0.2, y: 0.3}, {x: 1, y: 1}];
        connectionFinder.chooseConnectionIndex.and.returnValue(2);
        trajectoryCalculator.calculateTrajectory.and.returnValue(newTrajectory);
        trajectoryCalculator.calculateLength.and.returnValue(1);

        particleReassigner.reassign(connections, [particle]);

        assert.strictEqual(particle.source, 0);
        assert.strictEqual(particle.target, 2);
        assert.strictEqual(particle.trajectory, newTrajectory);
        assert.strictEqual(particle.trajectoryLength, 1);
        assert.strictEqual(particle.trajectoryProgress, 0);
        assert.deepStrictEqual(
            trajectoryCalculator.calculateTrajectory.mock.calls[0].arguments,
            [{x: 0.2, y: 0.3}, {x: 1, y: 1}]
        );
    });

    it('should mark particle for removal when no replacement source exists', function (): void {
        const deadSource: ConnectionEntity = new ConnectionEntity();
        deadSource.value = 0;
        const target: ConnectionEntity = new ConnectionEntity();
        target.value = -5;
        const particle: ParticleEntity = new ParticleEntity();
        particle.source = 0;
        particle.target = 1;
        connectionFinder.chooseConnectionIndex.and.returnValue(undefined);

        particleReassigner.reassign([deadSource, target], [particle]);

        assert.strictEqual(particle.source, undefined);
        assert.strictEqual(particle.target, undefined);
    });
});

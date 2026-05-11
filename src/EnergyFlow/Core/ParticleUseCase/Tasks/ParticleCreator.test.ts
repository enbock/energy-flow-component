import {describe, it, beforeEach} from 'node:test';
import * as assert from 'node:assert';
import {mock} from '../../../../../test/mock';
import ParticleCreator from './ParticleCreator';
import ConnectionFinder from './ConnectionFinder';
import TrajectoryCalculator from './TrajectoryCalculator';
import Config from '../../Config';
import ConnectionEntity from '../../ConnectionUseCase/ConnectionEntity';
import ParticleEntity from '../../ParticleEntity';

describe('EnergyFlow.Core.ParticleUseCase.Tasks.ParticleCreator', function (): void {
    let config: Config;
    let connectionFinder: Mocked<ConnectionFinder>;
    let trajectoryCalculator: Mocked<TrajectoryCalculator>;
    let particleCreator: ParticleCreator;

    beforeEach(function (): void {
        config = new Config();
        config.particleCount = 1;
        connectionFinder = mock<ConnectionFinder>();
        trajectoryCalculator = mock<TrajectoryCalculator>();
        particleCreator = new ParticleCreator(config, connectionFinder, trajectoryCalculator);
    });

    it('should create a particle with a precomputed trajectory from source to target', function (): void {
        const source: ConnectionEntity = new ConnectionEntity();
        source.value = 5;
        source.x = -1;
        source.y = 0;
        const target: ConnectionEntity = new ConnectionEntity();
        target.value = -5;
        target.x = 1;
        target.y = 0;
        const connections: Array<ConnectionEntity> = [source, target];
        const particles: Array<ParticleEntity> = [];
        const trajectory: Array<{x: number, y: number}> = [
            {x: -1, y: 0},
            {x: 0, y: 0},
            {x: 1, y: 0}
        ];
        let chooseCall: number = 0;
        connectionFinder.chooseConnectionIndex.and.callFake(function (): number {
            return chooseCall++ === 0 ? 0 : 1;
        });
        trajectoryCalculator.calculateTrajectory.and.returnValue(trajectory);
        trajectoryCalculator.calculateLength.and.returnValue(2);

        particleCreator.createParticles(connections, particles);

        assert.strictEqual(particles.length, 1);
        assert.strictEqual(particles[0].source, 0);
        assert.strictEqual(particles[0].target, 1);
        assert.strictEqual(particles[0].trajectory, trajectory);
        assert.strictEqual(particles[0].trajectoryLength, 2);
        assert.ok(particles[0].trajectoryProgress >= 0 && particles[0].trajectoryProgress < 1);
        assert.deepStrictEqual(
            trajectoryCalculator.calculateTrajectory.mock.calls[0].arguments,
            [{x: -1, y: 0}, {x: 1, y: 0}]
        );
    });

    it('should distribute the initial position along the trajectory based on the random progress', function (): void {
        const source: ConnectionEntity = new ConnectionEntity();
        source.value = 5;
        source.x = -1;
        source.y = 0;
        const target: ConnectionEntity = new ConnectionEntity();
        target.value = -5;
        target.x = 1;
        target.y = 0;
        const connections: Array<ConnectionEntity> = [source, target];
        const trajectory: Array<{x: number, y: number}> = [
            {x: -1, y: 0},
            {x: 1, y: 0}
        ];
        let chooseCall: number = 0;
        connectionFinder.chooseConnectionIndex.and.callFake(function (): number {
            return chooseCall++ === 0 ? 0 : 1;
        });
        trajectoryCalculator.calculateTrajectory.and.returnValue(trajectory);
        trajectoryCalculator.calculateLength.and.returnValue(2);
        const backupRandom: () => number = Math.random;
        Math.random = function (): number { return 0.5; };

        try {
            const particles: Array<ParticleEntity> = [];
            particleCreator.createParticles(connections, particles);

            assert.strictEqual(particles[0].trajectoryProgress, 0.5);
            assert.deepStrictEqual(particles[0].position, {x: 0, y: 0});
        } finally {
            Math.random = backupRandom;
        }
    });

    it('should immediately fill particles up to the configured maximum on first call', function (): void {
        config.particleCount = 5;
        const source: ConnectionEntity = new ConnectionEntity();
        source.value = 5;
        source.x = -1;
        source.y = 0;
        const target: ConnectionEntity = new ConnectionEntity();
        target.value = -5;
        target.x = 1;
        target.y = 0;
        const connections: Array<ConnectionEntity> = [source, target];
        const particles: Array<ParticleEntity> = [];
        const trajectory: Array<{x: number, y: number}> = [{x: -1, y: 0}, {x: 1, y: 0}];
        let chooseCall: number = 0;
        connectionFinder.chooseConnectionIndex.and.callFake(function (): number {
            return chooseCall++ % 2 === 0 ? 0 : 1;
        });
        trajectoryCalculator.calculateTrajectory.and.returnValue(trajectory);
        trajectoryCalculator.calculateLength.and.returnValue(2);

        particleCreator.createParticles(connections, particles);

        assert.strictEqual(particles.length, 5);
    });

    it('should not create particles when no positive source is available', function (): void {
        config.particleCount = 5;
        const connections: Array<ConnectionEntity> = [];
        const particles: Array<ParticleEntity> = [];
        connectionFinder.chooseConnectionIndex.and.returnValue(undefined);

        particleCreator.createParticles(connections, particles);

        assert.strictEqual(particles.length, 0);
    });
});

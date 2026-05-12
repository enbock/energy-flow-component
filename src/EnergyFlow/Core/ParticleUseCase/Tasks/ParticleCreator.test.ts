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

            assert.strictEqual(particles[0].trajectoryProgress, 0.05);
            assert.deepStrictEqual(particles[0].position, {x: -0.9, y: 0});
        } finally {
            Math.random = backupRandom;
        }
    });

    it('should respect the per-source spawn limit per call', function (): void {
        config.particleCount = 10;
        config.particleSpawnPerSource = 2;
        const sourceA: ConnectionEntity = new ConnectionEntity();
        sourceA.value = 5;
        sourceA.x = -1;
        sourceA.y = 0;
        const sourceB: ConnectionEntity = new ConnectionEntity();
        sourceB.value = 5;
        sourceB.x = 0;
        sourceB.y = 1;
        const target: ConnectionEntity = new ConnectionEntity();
        target.value = -5;
        target.x = 1;
        target.y = 0;
        const connections: Array<ConnectionEntity> = [sourceA, sourceB, target];
        const particles: Array<ParticleEntity> = [];
        const trajectory: Array<{x: number, y: number}> = [{x: -1, y: 0}, {x: 1, y: 0}];
        let chooseCall: number = 0;
        connectionFinder.chooseConnectionIndex.and.callFake(function (_: Array<ConnectionEntity>, positive: boolean): number {
            if (positive === false) return 2;
            return chooseCall++ % 2 === 0 ? 0 : 1;
        });
        trajectoryCalculator.calculateTrajectory.and.returnValue(trajectory);
        trajectoryCalculator.calculateLength.and.returnValue(2);

        particleCreator.createParticles(connections, particles);

        assert.strictEqual(particles.length, 4);
        const fromSourceA: number = particles.filter(function (p: ParticleEntity): boolean {
            return p.source === 0;
        }).length;
        const fromSourceB: number = particles.filter(function (p: ParticleEntity): boolean {
            return p.source === 1;
        }).length;
        assert.strictEqual(fromSourceA, 2);
        assert.strictEqual(fromSourceB, 2);
    });

    it('should not create particles when no positive source is available', function (): void {
        config.particleCount = 5;
        const connections: Array<ConnectionEntity> = [];
        const particles: Array<ParticleEntity> = [];
        connectionFinder.chooseConnectionIndex.and.returnValue(undefined);

        particleCreator.createParticles(connections, particles);

        assert.strictEqual(particles.length, 0);
    });

    it('should scale particle count proportionally to the positive power against maxPowerAt', function (): void {
        config.particleCount = 100;
        config.particleSpawnPerSource = 100;
        config.maxPowerAt = 20000;
        const sourceA: ConnectionEntity = new ConnectionEntity();
        sourceA.value = 4000;
        sourceA.x = -1;
        sourceA.y = 0;
        const sourceB: ConnectionEntity = new ConnectionEntity();
        sourceB.value = 1000;
        sourceB.x = 0;
        sourceB.y = 1;
        const target: ConnectionEntity = new ConnectionEntity();
        target.value = -5000;
        target.x = 1;
        target.y = 0;
        const connections: Array<ConnectionEntity> = [sourceA, sourceB, target];
        const particles: Array<ParticleEntity> = [];
        const trajectory: Array<{x: number, y: number}> = [{x: -1, y: 0}, {x: 1, y: 0}];
        connectionFinder.chooseConnectionIndex.and.callFake(function (_: Array<ConnectionEntity>, positive: boolean): number {
            return positive === false ? 2 : 0;
        });
        trajectoryCalculator.calculateTrajectory.and.returnValue(trajectory);
        trajectoryCalculator.calculateLength.and.returnValue(2);

        particleCreator.createParticles(connections, particles);
        particleCreator.createParticles(connections, particles);
        particleCreator.createParticles(connections, particles);
        particleCreator.createParticles(connections, particles);

        assert.strictEqual(particles.length, 25);
    });

    it('should cap particle count at the configured maximum when power exceeds maxPowerAt', function (): void {
        config.particleCount = 10;
        config.particleSpawnPerSource = 100;
        config.maxPowerAt = 1000;
        const source: ConnectionEntity = new ConnectionEntity();
        source.value = 50000;
        source.x = -1;
        source.y = 0;
        const target: ConnectionEntity = new ConnectionEntity();
        target.value = -50000;
        target.x = 1;
        target.y = 0;
        const connections: Array<ConnectionEntity> = [source, target];
        const particles: Array<ParticleEntity> = [];
        const trajectory: Array<{x: number, y: number}> = [{x: -1, y: 0}, {x: 1, y: 0}];
        connectionFinder.chooseConnectionIndex.and.callFake(function (_: Array<ConnectionEntity>, positive: boolean): number {
            return positive === false ? 1 : 0;
        });
        trajectoryCalculator.calculateTrajectory.and.returnValue(trajectory);
        trajectoryCalculator.calculateLength.and.returnValue(2);

        particleCreator.createParticles(connections, particles);

        assert.strictEqual(particles.length, 10);
    });

    it('should scale the spawn frequency proportionally to the positive power', function (): void {
        config.particleCount = 100;
        config.particleSpawnPerSource = 1;
        config.maxPowerAt = 20000;
        const source: ConnectionEntity = new ConnectionEntity();
        source.value = 5000;
        source.x = -1;
        source.y = 0;
        const target: ConnectionEntity = new ConnectionEntity();
        target.value = -5000;
        target.x = 1;
        target.y = 0;
        const connections: Array<ConnectionEntity> = [source, target];
        const particles: Array<ParticleEntity> = [];
        const trajectory: Array<{x: number, y: number}> = [{x: -1, y: 0}, {x: 1, y: 0}];
        connectionFinder.chooseConnectionIndex.and.callFake(function (_: Array<ConnectionEntity>, positive: boolean): number {
            return positive === false ? 1 : 0;
        });
        trajectoryCalculator.calculateTrajectory.and.returnValue(trajectory);
        trajectoryCalculator.calculateLength.and.returnValue(2);

        particleCreator.createParticles(connections, particles);
        particleCreator.createParticles(connections, particles);
        particleCreator.createParticles(connections, particles);
        particleCreator.createParticles(connections, particles);

        assert.strictEqual(particles.length, 1);
    });

    it('should spawn the full per-source rate on every tick when power matches maxPowerAt', function (): void {
        config.particleCount = 100;
        config.particleSpawnPerSource = 2;
        config.maxPowerAt = 10000;
        const source: ConnectionEntity = new ConnectionEntity();
        source.value = 10000;
        source.x = -1;
        source.y = 0;
        const target: ConnectionEntity = new ConnectionEntity();
        target.value = -10000;
        target.x = 1;
        target.y = 0;
        const connections: Array<ConnectionEntity> = [source, target];
        const particles: Array<ParticleEntity> = [];
        const trajectory: Array<{x: number, y: number}> = [{x: -1, y: 0}, {x: 1, y: 0}];
        connectionFinder.chooseConnectionIndex.and.callFake(function (_: Array<ConnectionEntity>, positive: boolean): number {
            return positive === false ? 1 : 0;
        });
        trajectoryCalculator.calculateTrajectory.and.returnValue(trajectory);
        trajectoryCalculator.calculateLength.and.returnValue(2);

        particleCreator.createParticles(connections, particles);

        assert.strictEqual(particles.length, 2);
    });

    it('should skip spawning entirely on most ticks when power is far below maxPowerAt', function (): void {
        config.particleCount = 100;
        config.particleSpawnPerSource = 2;
        config.maxPowerAt = 20000;
        const source: ConnectionEntity = new ConnectionEntity();
        source.value = 1000;
        source.x = -1;
        source.y = 0;
        const target: ConnectionEntity = new ConnectionEntity();
        target.value = -1000;
        target.x = 1;
        target.y = 0;
        const connections: Array<ConnectionEntity> = [source, target];
        const particles: Array<ParticleEntity> = [];
        const trajectory: Array<{x: number, y: number}> = [{x: -1, y: 0}, {x: 1, y: 0}];
        connectionFinder.chooseConnectionIndex.and.callFake(function (_: Array<ConnectionEntity>, positive: boolean): number {
            return positive === false ? 1 : 0;
        });
        trajectoryCalculator.calculateTrajectory.and.returnValue(trajectory);
        trajectoryCalculator.calculateLength.and.returnValue(2);

        particleCreator.createParticles(connections, particles);

        assert.strictEqual(particles.length, 0);
    });
});

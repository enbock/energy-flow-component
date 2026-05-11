import {describe, it, beforeEach} from 'node:test';
import * as assert from 'node:assert';
import ParticleAnimator from './ParticleAnimator';
import Config from '../../Config';
import ParticleEntity from '../../ParticleEntity';
import ConnectionEntity from '../../ConnectionUseCase/ConnectionEntity';

describe('EnergyFlow.Core.ParticleUseCase.Tasks.ParticleAnimator', function (): void {
    let config: Config;
    let particleAnimator: ParticleAnimator;

    beforeEach(function (): void {
        config = new Config();
        config.particleSpeed = 1;
        particleAnimator = new ParticleAnimator(config);
    });

    it('should advance a particle along its trajectory', function (): void {
        const particle: ParticleEntity = new ParticleEntity();
        particle.source = 0;
        particle.target = 1;
        particle.trajectory = [
            {x: 0, y: 0},
            {x: 1, y: 0},
            {x: 2, y: 0}
        ];
        particle.trajectoryLength = 2;
        particle.trajectoryProgress = 0;
        const connections: Array<ConnectionEntity> = [];

        particleAnimator.updateParticles(connections, [particle]);

        assert.ok(particle.trajectoryProgress > 0);
        assert.ok(particle.position.x > 0);
        assert.strictEqual(particle.position.y, 0);
    });

    it('should mark a particle as arrived when trajectory progress reaches the end', function (): void {
        const particle: ParticleEntity = new ParticleEntity();
        particle.source = 0;
        particle.target = 1;
        particle.trajectory = [
            {x: 0, y: 0},
            {x: 1, y: 0}
        ];
        particle.trajectoryLength = 1;
        particle.trajectoryProgress = 0.9999;
        config.particleSpeed = 10000;
        const connections: Array<ConnectionEntity> = [];

        particleAnimator.updateParticles(connections, [particle]);

        assert.strictEqual(particle.source, undefined);
        assert.strictEqual(particle.target, undefined);
        assert.deepStrictEqual(particle.position, {x: 1, y: 0});
    });
});

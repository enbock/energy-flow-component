import {describe, it, beforeEach} from 'node:test';
import * as assert from 'node:assert';
import {mock} from '../../../../test/mock';
import ParticleUseCase from './ParticleUseCase';
import ParticleCreator from './Tasks/ParticleCreator';
import ParticleCleaner from './Tasks/ParticleCleaner';
import ParticleAnimator from './Tasks/ParticleAnimator';
import ParticleRecycler from './Tasks/ParticleRecycler';
import ParticleReassigner from './Tasks/ParticleReassigner';
import ParticleRebalancer from './Tasks/ParticleRebalancer';
import StateStorage from '../StateStorage';
import GetParticlesResponse from './GetParticlesResponse';
import ParticleEntity from '../ParticleEntity';
import ConnectionEntity from '../ConnectionUseCase/ConnectionEntity';

describe('EnergyFlow.Core.ParticleUseCase.ParticleUseCase', function (): void {
    let particleUseCase: ParticleUseCase;
    let particleCreator: Mocked<ParticleCreator>;
    let particleCleaner: Mocked<ParticleCleaner>;
    let particleAnimator: Mocked<ParticleAnimator>;
    let particleRecycler: Mocked<ParticleRecycler>;
    let particleReassigner: Mocked<ParticleReassigner>;
    let particleRebalancer: Mocked<ParticleRebalancer>;
    let stateStorage: Mocked<StateStorage>;

    beforeEach(function (): void {
        particleCreator = mock<ParticleCreator>();
        particleCleaner = mock<ParticleCleaner>();
        particleAnimator = mock<ParticleAnimator>();
        particleRecycler = mock<ParticleRecycler>();
        particleReassigner = mock<ParticleReassigner>();
        particleRebalancer = mock<ParticleRebalancer>();
        stateStorage = mock<StateStorage>();

        particleUseCase = new ParticleUseCase(
            particleCreator,
            particleCleaner,
            particleAnimator,
            particleRecycler,
            particleReassigner,
            particleRebalancer,
            stateStorage
        );
    });

    it('should get particles and set them in response', async function (): Promise<void> {
        const response: GetParticlesResponse = {particles: []};
        const particles: Array<ParticleEntity> = [<MockedObject>'test::particle'];

        stateStorage.getParticles.and.returnValue(particles);

        await particleUseCase.getParticles(response);

        assert.strictEqual(stateStorage.getParticles.mock.calls.length, 1);
        assert.strictEqual(response.particles, particles);
    });

    it('should tick and update particles', function (): void {
        const particle: ParticleEntity = new ParticleEntity();
        particle.source = 0;
        particle.target = 1;
        const source: ConnectionEntity = new ConnectionEntity();
        source.value = 10;
        const target: ConnectionEntity = new ConnectionEntity();
        target.value = -10;
        const particles: Array<ParticleEntity> = [particle];
        const connections: Array<ConnectionEntity> = [source, target];

        stateStorage.getParticles.and.returnValue(particles);
        stateStorage.getConnections.and.returnValue(connections);
        particleCleaner.cleanParticles.and.returnValue(particles);

        particleUseCase.tick();

        assert.strictEqual(stateStorage.getParticles.mock.calls.length, 1);
        assert.deepStrictEqual(particleCreator.createParticles.mock.calls[0].arguments, [connections, particles]);
        assert.deepStrictEqual(particleAnimator.updateParticles.mock.calls[0].arguments, [connections, particles]);
        assert.deepStrictEqual(particleRecycler.recycle.mock.calls[0].arguments, [connections, particles]);
        assert.deepStrictEqual(particleReassigner.reassign.mock.calls[0].arguments, [connections, particles]);
        assert.deepStrictEqual(particleRebalancer.rebalance.mock.calls[0].arguments, [connections, particles]);
        assert.deepStrictEqual(stateStorage.setParticles.mock.calls[0].arguments, [particles]);
    });

    it('should not destroy particles directly when their source becomes invalid', function (): void {
        const particle: ParticleEntity = new ParticleEntity();
        particle.source = 0;
        particle.target = 1;
        const source: ConnectionEntity = new ConnectionEntity();
        source.value = -5;
        const target: ConnectionEntity = new ConnectionEntity();
        target.value = -10;
        const particles: Array<ParticleEntity> = [particle];
        const connections: Array<ConnectionEntity> = [source, target];

        stateStorage.getParticles.and.returnValue(particles);
        stateStorage.getConnections.and.returnValue(connections);
        particleCleaner.cleanParticles.and.returnValue(particles);

        particleUseCase.tick();

        assert.strictEqual(particle.source, 0);
        assert.strictEqual(particle.target, 1);
        assert.deepStrictEqual(particleReassigner.reassign.mock.calls[0].arguments, [connections, particles]);
    });
});

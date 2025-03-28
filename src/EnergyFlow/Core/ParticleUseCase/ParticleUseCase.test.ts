import ParticleUseCase from './ParticleUseCase';
import ParticleCreator from './Tasks/ParticleCreator';
import ParticleCleaner from './Tasks/ParticleCleaner';
import ParticleAnimator from './Tasks/ParticleAnimator';
import StateStorage from '../StateStorage';
import GetParticlesResponse from './GetParticlesResponse';
import ParticleEntity from '../ParticleEntity';
import ConnectionEntity from '../ConnectionUseCase/ConnectionEntity';

describe('ParticleUseCase', function (): void {
    let particleUseCase: ParticleUseCase,
        particleCreator: Mocked<ParticleCreator>,
        particleCleaner: Mocked<ParticleCleaner>,
        particleAnimator: Mocked<ParticleAnimator>,
        stateStorage: Mocked<StateStorage>
    ;

    beforeEach(function (): void {
        particleCreator = mock<ParticleCreator>();
        particleCleaner = mock<ParticleCleaner>();
        particleAnimator = mock<ParticleAnimator>();
        stateStorage = mock<StateStorage>();

        particleUseCase = new ParticleUseCase(
            particleCreator,
            particleCleaner,
            particleAnimator,
            stateStorage,
            mock()
        );
    });

    it('should get particles and set them in response', async function (): Promise<void> {
        const response: GetParticlesResponse = {particles: []};
        const particles: Array<ParticleEntity> = [<MockedObject>'test::particle'];

        stateStorage.getParticles.and.returnValue(particles);

        await particleUseCase.getParticles(response);

        expect(stateStorage.getParticles).toHaveBeenCalled();
        expect(response.particles).toBe(particles);
    });

    it('should tick and update particles', function (): void {
        const particles: Array<ParticleEntity> = [<MockedObject>'test::particle'];
        const connections: Array<ConnectionEntity> = [<MockedObject>'test::connection'];

        stateStorage.getParticles.and.returnValue(particles);
        stateStorage.getConnections.and.returnValue(connections);
        particleCleaner.cleanParticles.and.returnValue(particles);

        particleUseCase.tick();

        expect(stateStorage.getParticles).toHaveBeenCalled();
        expect(particleCreator.createParticles).toHaveBeenCalledWith(connections, particles);
        expect(particleAnimator.updateParticles).toHaveBeenCalledWith(connections, particles);
        expect(stateStorage.setParticles).toHaveBeenCalledWith(particles);
    });
});

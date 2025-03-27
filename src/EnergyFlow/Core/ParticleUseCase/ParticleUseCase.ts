import ParticleCreator from './Tasks/ParticleCreator';
import ParticleCleaner from './Tasks/ParticleCleaner';
import ParticleAnimator from './Tasks/ParticleAnimator';
import StateStorage from '../StateStorage';
import ParticleEntity from '../ParticleEntity';

export default class ParticleUseCase {
    constructor(
        private particleCreator: ParticleCreator,
        private particleCleaner: ParticleCleaner,
        private particleAnimator: ParticleAnimator,
        private stateStorage: StateStorage
    ) {
    }

    public tick(): void {
        const particles: Array<ParticleEntity> = this.stateStorage.getParticles();
        this.particleCreator.createParticles(particles);
        this.particleAnimator.updateParticles(this.stateStorage.getConnections(), particles);

        this.stateStorage.setParticles(
            this.particleCleaner.cleanParticles(particles)
        );
    }
}

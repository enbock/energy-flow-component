import ParticleCreator from './Tasks/ParticleCreator';
import ParticleCleaner from './Tasks/ParticleCleaner';
import ParticleAnimator from './Tasks/ParticleAnimator';
import ParticleRecycler from './Tasks/ParticleRecycler';
import ParticleReassigner from './Tasks/ParticleReassigner';
import ParticleRebalancer from './Tasks/ParticleRebalancer';
import StateStorage from '../StateStorage';
import ParticleEntity from '../ParticleEntity';
import GetParticlesResponse from './GetParticlesResponse';
import ConnectionEntity from '../ConnectionUseCase/ConnectionEntity';
import Config from '../Config';

export default class ParticleUseCase {
    constructor(
        private particleCreator: ParticleCreator,
        private particleCleaner: ParticleCleaner,
        private particleAnimator: ParticleAnimator,
        private particleRecycler: ParticleRecycler,
        private particleReassigner: ParticleReassigner,
        private particleRebalancer: ParticleRebalancer,
        private stateStorage: StateStorage,
        private config: Config
    ) {
    }

    public getParticles(response: GetParticlesResponse): void {
        response.particles = this.stateStorage.getParticles();
    }

    public tick(): void {
        const particles: Array<ParticleEntity> = this.stateStorage.getParticles();
        const connections: Array<ConnectionEntity> = this.stateStorage.getConnections();

        this.particleCreator.createParticles(connections, particles);
        this.particleAnimator.updateParticles(connections, particles);

        if (this.config.recyclingEnabled) {
            this.particleRecycler.recycle(connections, particles);
            this.particleReassigner.reassign(connections, particles);
            this.particleRebalancer.rebalance(connections, particles);
        }

        this.stateStorage.setParticles(
            this.particleCleaner.cleanParticles(connections, particles)
        );
    }
}

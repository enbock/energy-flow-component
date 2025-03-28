import ParticleCreator from './Tasks/ParticleCreator';
import ParticleCleaner from './Tasks/ParticleCleaner';
import ParticleAnimator from './Tasks/ParticleAnimator';
import StateStorage from '../StateStorage';
import ParticleEntity from '../ParticleEntity';
import GetParticlesResponse from './GetParticlesResponse';
import ConnectionEntity from '../ConnectionUseCase/ConnectionEntity';
import ConnectionFinder from './Tasks/ConnectionFinder';

export default class ParticleUseCase {
    constructor(
        private particleCreator: ParticleCreator,
        private particleCleaner: ParticleCleaner,
        private particleAnimator: ParticleAnimator,
        private stateStorage: StateStorage,
        private connectionFinder: ConnectionFinder
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

        for (const p of particles) {
            if (
                (p.source !== undefined && (!connections[p.source] || connections[p.source].value <= 0))
                || (p.target !== undefined && connections[p.target]?.value > 0)
            ) {
                p.source = this.connectionFinder.chooseConnectionIndex(connections, true);
                p.target = this.connectionFinder.chooseConnectionIndex(connections, false);
            }
        }

        this.stateStorage.setParticles(
            this.particleCleaner.cleanParticles(connections, particles)
        );
    }
}

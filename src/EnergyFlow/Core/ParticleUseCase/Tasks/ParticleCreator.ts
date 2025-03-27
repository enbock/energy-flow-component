import ParticleEntity from '../../ParticleEntity';
import Config from '../../Config';

export default class ParticleCreator {
    constructor(
        private config: Config
    ) {
    }

    public createParticles(particles: Array<ParticleEntity>): void {
        if (particles.length >= this.config.particleCount) return;

        const batchSize: number = Math.round(this.config.particleCount * 0.1);

        for (let i = particles.length; i < batchSize || particles.length < this.config.particleCount; i++) {
            particles.push(new ParticleEntity());
        }
    }
}

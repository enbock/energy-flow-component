import ParticleEntity from '../../ParticleEntity';

export default class ParticleCleaner {
    public cleanParticles(particles: Array<ParticleEntity>): Array<ParticleEntity> {
        return particles.filter(p => p.source !== undefined && p.target !== undefined);
    }
}

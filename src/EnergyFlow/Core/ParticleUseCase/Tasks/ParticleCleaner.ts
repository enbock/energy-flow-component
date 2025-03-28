import ParticleEntity from '../../ParticleEntity';
import ConnectionEntity from '../../ConnectionUseCase/ConnectionEntity';

export default class ParticleCleaner {
    public cleanParticles(
        connections: Array<ConnectionEntity>,
        particles: Array<ParticleEntity>
    ): Array<ParticleEntity> {
        return particles.filter(p => {
            return p.source !== undefined && p.target !== undefined;
        });
    }
}

import ParticleEntity from '../../ParticleEntity';
import ConnectionEntity from '../../ConnectionUseCase/ConnectionEntity';

export default class ParticleCleaner {
    public cleanParticles(
        connections: Array<ConnectionEntity>,
        particles: Array<ParticleEntity>
    ): Array<ParticleEntity> {
        return particles.filter(p => {
            if (Boolean(p.source && connections[p.source]?.value) == false) p.source = undefined;
            if (p.target && connections[p.target]?.value > 0) p.target = undefined;
            return p.source !== undefined && p.target !== undefined;
        });
    }
}

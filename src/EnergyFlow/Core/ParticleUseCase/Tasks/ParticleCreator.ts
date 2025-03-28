import ParticleEntity from '../../ParticleEntity';
import Config from '../../Config';
import ConnectionEntity from '../../ConnectionUseCase/ConnectionEntity';
import ConnectionFinder from './ConnectionFinder';

export default class ParticleCreator {
    constructor(
        private config: Config,
        private connectionFinder: ConnectionFinder
    ) {
    }

    public createParticles(connections: Array<ConnectionEntity>, particles: Array<ParticleEntity>): void {
        if (particles.length >= this.config.particleCount) return;

        const sources: Array<ConnectionEntity> = connections.filter(c => c.value > 0);

        for (const source of sources) {
            if (particles.length == 0) {
                this.createParticleBatch(particles, connections, source);
                continue;
            }
            let found: boolean = false;
            for (const particle of particles) {
                const isInSourceZone: boolean | undefined =
                    Math.hypot(source.x - particle.position.x, source.y - particle.position.y)
                    < this.config.particleSize
                ;

                if (isInSourceZone) {
                    found = true;
                    break;
                }
            }
            if (found === false) {
                this.createParticleBatch(particles, connections, source);
            }
        }
    }

    private createParticleBatch(
        particles: Array<ParticleEntity>,
        connections: Array<ConnectionEntity>,
        source: ConnectionEntity
    ): void {
        for (let i = 0; i < this.config.particleCreateBatchSize; i++) {
            const newParticle: ParticleEntity = new ParticleEntity();
            particles.push(newParticle);

            this.resetParticle(newParticle, connections, source);
        }
    }

    private resetParticle(
        particle: ParticleEntity,
        connections: Array<ConnectionEntity>,
        sourceConnection: ConnectionEntity
    ): void {
        particle.position.x = sourceConnection.x;
        particle.position.y = sourceConnection.y;

        const source: number = connections.indexOf(sourceConnection);
        particle.source = source > -1 ? source : undefined;
        particle.target = this.connectionFinder.chooseConnectionIndex(connections, false);
        particle.velocity.x = 0;
        particle.velocity.y = 0;
        particle.progress = 0;
        particle.progressBefore = 1;
    }
}

import ParticleEntity from '../../ParticleEntity';
import ConnectionEntity from '../../ConnectionUseCase/ConnectionEntity';
import Config from '../../Config';

export default class ParticleAnimator {
    constructor(
        private config: Config
    ) {
    }

    public updateParticles(
        connections: Array<ConnectionEntity>,
        particles: Array<ParticleEntity>
    ): void {
        const speed = this.calculateSpeed(this.config.particleSpeed);
        const jitterAmplitude = speed * 1.5;

        for (const particle of particles) {
            this.updateParticleVelocity(particle, connections, speed, jitterAmplitude);
            this.updateParticlePosition(particle);
            this.handleParticleArrival(particle, connections);
        }
    }

    private calculateSpeed(particleSpeed: number): number {
        return (particleSpeed / 3500) * Math.sqrt(2 * 2);
    }

    private updateParticleVelocity(
        particle: ParticleEntity,
        connections: Array<ConnectionEntity>,
        speed: number,
        jitterAmplitude: number
    ): void {
        if (particle.target === undefined) return;
        if (particle.source === undefined) return;

        const px = particle.position.x;
        const py = particle.position.y;

        // Vektor vom Partikel zur Mitte
        let dxCenter = 0 - px;
        let dyCenter = 0 - py;

        let ax: number = dxCenter;
        let ay: number = dyCenter;
        const aMag = Math.hypot(ax, ay);
        if (aMag !== 0) {
            ax /= aMag;
            ay /= aMag;
        }

        const targetConnection: ConnectionEntity | undefined = connections[particle.target];

        if (targetConnection === undefined) {
            particle.target = undefined;
            return;
        }

        const dx: number = targetConnection.x - particle.position.x;
        const dy: number = targetConnection.y - particle.position.y;
        const dist: number = Math.sqrt(dx * dx + dy * dy);

        if (particle.progress < 1) {
            this.updateParticleProgress(particle, connections);
        }

        const centerModifier: number = 1 - particle.progress;
        const positionModifier: number = particle.progress;
        particle.velocity.x += (speed * dx / dist) * positionModifier + (ax * speed) * centerModifier;
        particle.velocity.y += (speed * dy / dist) * positionModifier + (ay * speed) * centerModifier;

        this.addJitterToVelocity(particle, jitterAmplitude);
    }

    private updateParticleProgress(particle: ParticleEntity, connections: Array<ConnectionEntity>): void {
        const sourceConnection: ConnectionEntity = connections[particle.source!];
        const distSourceCenter: number = this.calculateDistance(sourceConnection.x, sourceConnection.y, 0, 0);
        const dist: number = this.calculateDistance(particle.position.x, particle.position.y, 0, 0);
        particle.progressBefore = particle.progress;
        particle.progress = 1 - (1 / distSourceCenter * dist);
        if (particle.progress < 0) particle.progress = 0;
        if (particle.progress < particle.progressBefore) particle.progress = 1;
    }

    private addJitterToVelocity(particle: ParticleEntity, jitterAmplitude: number): void {
        particle.velocity.x += (Math.random() - 0.5) * jitterAmplitude;
        particle.velocity.y += (Math.random() - 0.5) * jitterAmplitude;
    }

    private updateParticlePosition(particle: ParticleEntity): void {
        particle.position.x += particle.velocity.x;
        particle.position.y += particle.velocity.y;

        particle.velocity.x *= 0.95;
        particle.velocity.y *= 0.95;
    }

    private handleParticleArrival(particle: ParticleEntity, connections: Array<ConnectionEntity>): void {
        const targetConnection: ConnectionEntity | undefined = particle.target !== undefined ? connections[particle.target] : undefined;
        const isInTargetZone: boolean | undefined = targetConnection && (
                Math.hypot(targetConnection.x - particle.position.x, targetConnection.y - particle.position.y)
                < this.config.targetSize
            )
        ;

        const isArrived: boolean = Boolean(isInTargetZone && (targetConnection?.value ?? 0) < 0);

        if (!targetConnection || particle.source === undefined || !connections[particle.source] || isArrived) {
            particle.source = particle.target = undefined;
        }
    }

    private calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
        const deltaX: number = x2 - x1;
        const deltaY: number = y2 - y1;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }
}

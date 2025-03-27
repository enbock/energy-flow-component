import ParticleEntity from '../../ParticleEntity';
import ConnectionEntity from '../../ConnectionUseCase/ConnectionEntity';
import ConnectionFinder from './ConnectionFinder';
import Config from '../../Config';

export default class ParticleAnimator {
    constructor(
        private connectionFinder: ConnectionFinder,
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
            this.updateParticleTarget(particle, connections);
            this.updateParticleVelocity(particle, connections, speed, jitterAmplitude);
            this.updateParticlePosition(particle);
            this.handleParticleArrival(particle, connections);
        }
    }

    private calculateSpeed(particleSpeed: number): number {
        return (particleSpeed / 3500) * Math.sqrt(2 * 2);
    }

    private updateParticleTarget(particle: ParticleEntity, connections: Array<ConnectionEntity>): void {
        if (!particle.target || connections[particle.target].value >= 0) {
            particle.target = this.connectionFinder.chooseConnectionIndex(connections, false);
        }
    }

    private updateParticleVelocity(
        particle: ParticleEntity,
        connections: Array<ConnectionEntity>,
        speed: number,
        jitterAmplitude: number
    ): void {
        const centerX = 0;
        const centerY = 0;
        const dxCenter = centerX - particle.position.x;
        const dyCenter = centerY - particle.position.y;
        const distCenter = Math.hypot(centerX, centerY);

        let ax = dxCenter / distCenter;
        let ay = dyCenter / distCenter;

        if (particle.target !== undefined) {
            const targetConnection = connections[particle.target];
            const dx = targetConnection.x - particle.position.x;
            const dy = targetConnection.y - particle.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (particle.source !== undefined && particle.progress < 1) {
                this.updateParticleProgress(particle, connections);
            }

            const centerMod = 1 - particle.progress;
            const posMod = particle.progress;
            particle.velocity.x += (speed * dx / dist) * posMod + (ax * speed) * centerMod;
            particle.velocity.y += (speed * dy / dist) * posMod + (ay * speed) * centerMod;

            this.addJitterToVelocity(particle, jitterAmplitude);
        }
    }

    private updateParticleProgress(particle: ParticleEntity, connections: Array<ConnectionEntity>): void {
        const sourceConnection = connections[particle.source!];
        const distSourceCenter = this.calculateDistance(sourceConnection.x, sourceConnection.y, 0, 0);
        const dist = this.calculateDistance(particle.position.x, particle.position.y, 0, 0);
        particle.progressBefore = particle.progress;
        particle.progress = 1 - (1 / distSourceCenter * dist);
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
        const targetConnection = particle.target !== undefined ? connections[particle.target] : undefined;
        const isInTargetZone = targetConnection &&
            Math.hypot(targetConnection.x - particle.position.x, targetConnection.y - particle.position.y) <
            Math.sqrt(2 * 2) * (this.config.particleSize / 150) * this.config.targetSize * 4;

        const isArrived = Boolean(isInTargetZone && (targetConnection?.value ?? 0) < 0);

        if (!targetConnection || particle.source === undefined || !connections[particle.source] || isArrived) {
            this.resetParticle(particle, connections);
        }
    }

    private resetParticle(particle: ParticleEntity, connections: Array<ConnectionEntity>): void {
        particle.source = this.connectionFinder.chooseConnectionIndex(connections, true);
        if (particle.source !== undefined) {
            const sourceConnection = connections[particle.source];
            particle.position.x = sourceConnection.x;
            particle.position.y = sourceConnection.y;
        }

        particle.target = this.connectionFinder.chooseConnectionIndex(connections, false);
        particle.velocity.x = 0;
        particle.velocity.y = 0;
        particle.progress = 0;
        particle.progressBefore = 1;
    }

    private calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
        const deltaX = x2 - x1;
        const deltaY = y2 - y1;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }
}

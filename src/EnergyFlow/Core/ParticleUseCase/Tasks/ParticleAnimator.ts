import ParticleEntity, {Coordinate} from '../../ParticleEntity';
import ConnectionEntity from '../../ConnectionUseCase/ConnectionEntity';
import Config from '../../Config';

export default class ParticleAnimator {
    constructor(
        private config: Config
    ) {
    }

    public updateParticles(
        _connections: Array<ConnectionEntity>,
        particles: Array<ParticleEntity>
    ): void {
        const speed: number = this.calculateSpeed(this.config.particleSpeed);

        for (const particle of particles) {
            this.advanceParticle(particle, speed);
        }
    }

    private calculateSpeed(particleSpeed: number): number {
        return (particleSpeed / 3500) * Math.sqrt(2 * 2);
    }

    private advanceParticle(particle: ParticleEntity, speed: number): void {
        if (particle.trajectory.length < 2 || particle.trajectoryLength <= 0) return;

        const progressDelta: number = speed / particle.trajectoryLength;
        particle.trajectoryProgress += progressDelta;

        if (particle.trajectoryProgress >= 1) {
            const lastPoint: Coordinate = particle.trajectory[particle.trajectory.length - 1];
            particle.position = {x: lastPoint.x, y: lastPoint.y};
            particle.source = undefined;
            particle.target = undefined;
            return;
        }

        const segments: number = particle.trajectory.length - 1;
        const scaled: number = particle.trajectoryProgress * segments;
        const index: number = Math.floor(scaled);
        const localT: number = scaled - index;
        const current: Coordinate = particle.trajectory[index];
        const next: Coordinate = particle.trajectory[index + 1];

        particle.position = {
            x: current.x + (next.x - current.x) * localT,
            y: current.y + (next.y - current.y) * localT
        };
    }
}

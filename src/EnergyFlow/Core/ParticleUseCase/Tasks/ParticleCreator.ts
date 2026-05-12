import ParticleEntity from '../../ParticleEntity';
import {Coordinate} from '../../ParticleEntity';
import Config from '../../Config';
import ConnectionEntity from '../../ConnectionUseCase/ConnectionEntity';
import ConnectionFinder from './ConnectionFinder';
import TrajectoryCalculator from './TrajectoryCalculator';

export default class ParticleCreator {
    private spawnAccumulator: number = 0;

    constructor(
        private config: Config,
        private connectionFinder: ConnectionFinder,
        private trajectoryCalculator: TrajectoryCalculator
    ) {
    }

    public createParticles(connections: Array<ConnectionEntity>, particles: Array<ParticleEntity>): void {
        const scale: number = this.calculatePowerScale(connections);
        const targetCount: number = Math.round(this.config.particleCount * scale);

        if (targetCount <= particles.length) return;
        if (scale <= 0) return;

        this.spawnAccumulator += scale;
        if (this.spawnAccumulator < 1) return;
        this.spawnAccumulator -= 1;

        const spawnLimit: number = this.config.particleSpawnPerSource;
        const spawnsPerSource: Map<number, number> = new Map();
        const maxAttempts: number = connections.length * spawnLimit + spawnLimit;
        let attempts: number = 0;

        while (particles.length < targetCount && attempts < maxAttempts) {
            attempts++;
            const sourceIndex: number | undefined = this.connectionFinder.chooseConnectionIndex(connections, true);
            if (sourceIndex === undefined) return;

            const currentSpawns: number = spawnsPerSource.get(sourceIndex) ?? 0;
            if (currentSpawns >= spawnLimit) continue;
            spawnsPerSource.set(sourceIndex, currentSpawns + 1);

            const newParticle: ParticleEntity = new ParticleEntity();
            particles.push(newParticle);
            this.resetParticle(newParticle, connections, connections[sourceIndex], sourceIndex);
        }
    }

    private calculatePowerScale(connections: Array<ConnectionEntity>): number {
        if (this.config.maxPowerAt <= 0) return 1;

        let positivePower: number = 0;
        for (const connection of connections) {
            if (connection.value > 0) positivePower += connection.value;
        }

        return Math.min(positivePower / this.config.maxPowerAt, 1);
    }

    private resetParticle(
        particle: ParticleEntity,
        connections: Array<ConnectionEntity>,
        sourceConnection: ConnectionEntity,
        sourceIndex: number
    ): void {
        particle.position = {x: sourceConnection.x, y: sourceConnection.y};
        particle.source = sourceIndex;
        particle.target = this.connectionFinder.chooseConnectionIndex(connections, false);

        if (particle.target === undefined) {
            particle.source = undefined;
            particle.trajectory = [];
            particle.trajectoryLength = 0;
            particle.trajectoryProgress = 0;
            return;
        }

        const targetConnection: ConnectionEntity = connections[particle.target];
        particle.trajectory = this.trajectoryCalculator.calculateTrajectory(
            {x: sourceConnection.x, y: sourceConnection.y},
            {x: targetConnection.x, y: targetConnection.y}
        );
        particle.trajectoryLength = this.trajectoryCalculator.calculateLength(particle.trajectory);
        particle.trajectoryProgress = Math.random() * 0.1;
        particle.position = this.calculatePositionAt(particle.trajectory, particle.trajectoryProgress);
    }

    private calculatePositionAt(trajectory: Array<Coordinate>, progress: number): Coordinate {
        const segments: number = trajectory.length - 1;
        if (segments <= 0) return {x: trajectory[0].x, y: trajectory[0].y};

        const scaled: number = progress * segments;
        const index: number = Math.min(Math.floor(scaled), segments - 1);
        const localT: number = scaled - index;
        const current: Coordinate = trajectory[index];
        const next: Coordinate = trajectory[index + 1];

        return {
            x: current.x + (next.x - current.x) * localT,
            y: current.y + (next.y - current.y) * localT
        };
    }
}

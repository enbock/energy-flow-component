import ParticleEntity from '../../ParticleEntity';
import {Coordinate} from '../../ParticleEntity';
import Config from '../../Config';
import ConnectionEntity from '../../ConnectionUseCase/ConnectionEntity';
import ConnectionFinder from './ConnectionFinder';
import TrajectoryCalculator from './TrajectoryCalculator';

export default class ParticleCreator {
    constructor(
        private config: Config,
        private connectionFinder: ConnectionFinder,
        private trajectoryCalculator: TrajectoryCalculator
    ) {
    }

    public createParticles(connections: Array<ConnectionEntity>, particles: Array<ParticleEntity>): void {
        while (particles.length < this.config.particleCount) {
            const sourceIndex: number | undefined = this.connectionFinder.chooseConnectionIndex(connections, true);
            if (sourceIndex === undefined) return;

            const newParticle: ParticleEntity = new ParticleEntity();
            particles.push(newParticle);
            this.resetParticle(newParticle, connections, connections[sourceIndex], sourceIndex);
        }
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
        particle.trajectoryProgress = Math.random();
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

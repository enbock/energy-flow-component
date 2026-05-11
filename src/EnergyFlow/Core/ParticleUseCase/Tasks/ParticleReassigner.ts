import ParticleEntity from '../../ParticleEntity';
import ConnectionEntity from '../../ConnectionUseCase/ConnectionEntity';
import ConnectionFinder from './ConnectionFinder';
import TrajectoryCalculator from './TrajectoryCalculator';

export default class ParticleReassigner {
    constructor(
        private connectionFinder: ConnectionFinder,
        private trajectoryCalculator: TrajectoryCalculator
    ) {
    }

    public reassign(connections: Array<ConnectionEntity>, particles: Array<ParticleEntity>): void {
        for (const particle of particles) {
            if (particle.source === undefined || particle.target === undefined) continue;

            const sourceValid: boolean = this.isPositiveSourceValid(connections, particle.source);
            const targetValid: boolean = this.isNegativeTargetValid(connections, particle.target);

            if (sourceValid && targetValid) continue;

            if (!targetValid) {
                const newTarget: number | undefined = this.connectionFinder.chooseConnectionIndex(connections, false);
                if (newTarget === undefined) {
                    particle.source = undefined;
                    particle.target = undefined;
                    continue;
                }
                const targetConnection: ConnectionEntity = connections[newTarget];
                particle.target = newTarget;
                particle.trajectory = this.trajectoryCalculator.calculateTrajectory(
                    {x: particle.position.x, y: particle.position.y},
                    {x: targetConnection.x, y: targetConnection.y}
                );
                particle.trajectoryLength = this.trajectoryCalculator.calculateLength(particle.trajectory);
                particle.trajectoryProgress = 0;
            }

            if (!sourceValid) {
                const newSource: number | undefined = this.connectionFinder.chooseConnectionIndex(connections, true);
                if (newSource === undefined) {
                    particle.source = undefined;
                    particle.target = undefined;
                    continue;
                }
                particle.source = newSource;
            }
        }
    }

    private isPositiveSourceValid(connections: Array<ConnectionEntity>, index: number): boolean {
        const connection: ConnectionEntity | undefined = connections[index];
        return connection !== undefined && connection.value > 0;
    }

    private isNegativeTargetValid(connections: Array<ConnectionEntity>, index: number): boolean {
        const connection: ConnectionEntity | undefined = connections[index];
        return connection !== undefined && connection.value < 0;
    }
}

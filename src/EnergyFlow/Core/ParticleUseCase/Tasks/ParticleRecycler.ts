import ParticleEntity from '../../ParticleEntity';
import ConnectionEntity from '../../ConnectionUseCase/ConnectionEntity';
import ConnectionFinder from './ConnectionFinder';
import TrajectoryCalculator from './TrajectoryCalculator';

export default class ParticleRecycler {
    constructor(
        private connectionFinder: ConnectionFinder,
        private trajectoryCalculator: TrajectoryCalculator
    ) {
    }

    public recycle(connections: Array<ConnectionEntity>, particles: Array<ParticleEntity>): void {
        for (const particle of particles) {
            if (particle.source !== undefined && particle.target !== undefined) continue;

            const newSource: number | undefined = this.connectionFinder.chooseConnectionIndex(connections, true);
            const newTarget: number | undefined = this.connectionFinder.chooseConnectionIndex(connections, false);
            if (newSource === undefined || newTarget === undefined) continue;

            const sourceConnection: ConnectionEntity = connections[newSource];
            const targetConnection: ConnectionEntity = connections[newTarget];

            particle.source = newSource;
            particle.target = newTarget;
            particle.position = {x: sourceConnection.x, y: sourceConnection.y};
            particle.trajectory = this.trajectoryCalculator.calculateTrajectory(
                {x: sourceConnection.x, y: sourceConnection.y},
                {x: targetConnection.x, y: targetConnection.y}
            );
            particle.trajectoryLength = this.trajectoryCalculator.calculateLength(particle.trajectory);
            particle.trajectoryProgress = 0;
        }
    }
}

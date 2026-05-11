import ParticleEntity from '../../ParticleEntity';
import ConnectionEntity from '../../ConnectionUseCase/ConnectionEntity';
import ConnectionFinder from './ConnectionFinder';
import TrajectoryCalculator from './TrajectoryCalculator';

export default class ParticleRebalancer {
    constructor(
        private connectionFinder: ConnectionFinder,
        private trajectoryCalculator: TrajectoryCalculator
    ) {
    }

    public rebalance(connections: Array<ConnectionEntity>, particles: Array<ParticleEntity>): void {
        const positiveIndices: Array<number> = [];
        let totalValue: number = 0;
        connections.forEach(function (connection: ConnectionEntity, index: number): void {
            if (connection.value > 0) {
                positiveIndices.push(index);
                totalValue += connection.value;
            }
        });
        if (positiveIndices.length === 0 || totalValue <= 0) return;

        const buckets: Map<number, Array<ParticleEntity>> = new Map();
        for (const index of positiveIndices) buckets.set(index, []);
        for (const particle of particles) {
            if (particle.source !== undefined && buckets.has(particle.source)) {
                buckets.get(particle.source)!.push(particle);
            }
        }

        const total: number = particles.length;
        const idealCounts: Map<number, number> = new Map();
        for (const index of positiveIndices) {
            idealCounts.set(index, Math.round((connections[index].value / totalValue) * total));
        }

        for (const index of positiveIndices) {
            const current: Array<ParticleEntity> = buckets.get(index)!;
            const ideal: number = idealCounts.get(index)!;
            while (current.length > ideal) {
                const underIndex: number | undefined = this.findUnderQuotaSource(
                    positiveIndices,
                    buckets,
                    idealCounts
                );
                if (underIndex === undefined) break;

                const particle: ParticleEntity = current.pop()!;
                this.transferParticle(particle, underIndex, connections);
                buckets.get(underIndex)!.push(particle);
            }
        }
    }

    private findUnderQuotaSource(
        positiveIndices: Array<number>,
        buckets: Map<number, Array<ParticleEntity>>,
        idealCounts: Map<number, number>
    ): number | undefined {
        for (const index of positiveIndices) {
            if (buckets.get(index)!.length < idealCounts.get(index)!) return index;
        }
        return undefined;
    }

    private transferParticle(
        particle: ParticleEntity,
        sourceIndex: number,
        connections: Array<ConnectionEntity>
    ): void {
        const newTarget: number | undefined = this.connectionFinder.chooseConnectionIndex(connections, false);
        if (newTarget === undefined) {
            particle.source = undefined;
            particle.target = undefined;
            return;
        }

        const targetConnection: ConnectionEntity = connections[newTarget];
        particle.source = sourceIndex;
        particle.target = newTarget;
        particle.trajectory = this.trajectoryCalculator.calculateTrajectory(
            {x: particle.position.x, y: particle.position.y},
            {x: targetConnection.x, y: targetConnection.y}
        );
        particle.trajectoryLength = this.trajectoryCalculator.calculateLength(particle.trajectory);
        particle.trajectoryProgress = 0;
    }
}

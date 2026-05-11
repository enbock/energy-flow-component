import {Coordinate} from '../../ParticleEntity';
import Config from '../../Config';

export default class TrajectoryCalculator {
    constructor(
        private config: Config
    ) {
    }

    public calculateTrajectory(source: Coordinate, target: Coordinate): Array<Coordinate> {
        const steps: number = this.config.trajectorySteps;
        const controlPoint: Coordinate = this.calculateControlPoint(source, target);
        const points: Array<Coordinate> = [];

        for (let i = 0; i <= steps; i++) {
            const t: number = i / steps;
            const u: number = 1 - t;
            const x: number = u * u * source.x + 2 * u * t * controlPoint.x + t * t * target.x;
            const y: number = u * u * source.y + 2 * u * t * controlPoint.y + t * t * target.y;
            points.push({x: x, y: y});
        }

        return points;
    }

    public calculateLength(trajectory: Array<Coordinate>): number {
        let length: number = 0;
        for (let i = 1; i < trajectory.length; i++) {
            const dx: number = trajectory[i].x - trajectory[i - 1].x;
            const dy: number = trajectory[i].y - trajectory[i - 1].y;
            length += Math.sqrt(dx * dx + dy * dy);
        }
        return length;
    }

    private calculateControlPoint(source: Coordinate, target: Coordinate): Coordinate {
        const midX: number = (source.x + target.x) * 0.5;
        const midY: number = (source.y + target.y) * 0.5;
        const jitter: number = (Math.random() - 0.5) * 0.4;

        return {
            x: midX * 0.2 + jitter,
            y: midY * 0.2 + jitter
        };
    }
}

import {describe, it, beforeEach} from 'node:test';
import * as assert from 'node:assert';
import TrajectoryCalculator from './TrajectoryCalculator';
import Config from '../../Config';

describe('EnergyFlow.Core.ParticleUseCase.Tasks.TrajectoryCalculator', function (): void {
    let config: Config;
    let trajectoryCalculator: TrajectoryCalculator;

    beforeEach(function (): void {
        config = new Config();
        config.trajectorySteps = 4;
        trajectoryCalculator = new TrajectoryCalculator(config);
    });

    it('should calculate a trajectory with steps+1 points starting at source and ending at target', function (): void {
        const source: {x: number, y: number} = {x: -1, y: 0};
        const target: {x: number, y: number} = {x: 1, y: 0};

        const trajectory: Array<{x: number, y: number}> = trajectoryCalculator.calculateTrajectory(source, target);

        assert.strictEqual(trajectory.length, 5);
        assert.strictEqual(trajectory[0].x, source.x);
        assert.strictEqual(trajectory[0].y, source.y);
        assert.strictEqual(trajectory[trajectory.length - 1].x, target.x);
        assert.strictEqual(trajectory[trajectory.length - 1].y, target.y);
    });

    it('should calculate the length as the sum of segment distances', function (): void {
        const trajectory: Array<{x: number, y: number}> = [
            {x: 0, y: 0},
            {x: 3, y: 0},
            {x: 3, y: 4}
        ];

        const length: number = trajectoryCalculator.calculateLength(trajectory);

        assert.strictEqual(length, 7);
    });
});

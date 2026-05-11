import {describe, it, beforeEach} from 'node:test';
import * as assert from 'node:assert';
import {createSpy, mock} from '../../../../../test/mock';
import AnimationHandler from './AnimationHandler';
import {PresentDataCallback} from '../../../../ControllerHandler';
import ParticleUseCase from '../../../Core/ParticleUseCase/ParticleUseCase';

describe('EnergyFlow.Application.Controller.Handler.AnimationHandler', function (): void {
    let animationHandler: AnimationHandler;
    let particleUseCase: Mocked<ParticleUseCase>;
    let presentDataCallback: MockFunction<PresentDataCallback>;
    let requestAnimationFrameSpy: MockFunction<(callback: FrameRequestCallback) => number>;

    beforeEach(function (): void {
        particleUseCase = mock<ParticleUseCase>();
        presentDataCallback = createSpy<PresentDataCallback>();
        animationHandler = new AnimationHandler(particleUseCase);
        requestAnimationFrameSpy = createSpy<(callback: FrameRequestCallback) => number>();
        global.requestAnimationFrame = requestAnimationFrameSpy as unknown as typeof global.requestAnimationFrame;
    });

    it('should initialize and start the simulation', function (): void {
        let counter: number = 0;

        requestAnimationFrameSpy.and.callFake(function (callback: FrameRequestCallback): number {
            if (counter++ == 0) callback(0);
            return 0;
        });

        animationHandler.initialize(presentDataCallback);

        assert.ok(requestAnimationFrameSpy.mock.calls.length > 0);
        assert.strictEqual(presentDataCallback.mock.calls.length, 2);
        assert.strictEqual(counter, 2);
    });
});

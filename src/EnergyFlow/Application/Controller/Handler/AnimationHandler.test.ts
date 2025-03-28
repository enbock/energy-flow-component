import AnimationHandler from './AnimationHandler';
import {PresentDataCallback} from '../../../../ControllerHandler';
import ParticleUseCase from '../../../Core/ParticleUseCase/ParticleUseCase';
import createSpy = jasmine.createSpy;
import Spy = jasmine.Spy;

describe('AnimationHandler', function (): void {
    let animationHandler: AnimationHandler,
        particleUseCase: Mocked<ParticleUseCase>,
        presentDataCallback!: PresentDataCallback;

    beforeEach(function (): void {
        particleUseCase = mock<ParticleUseCase>();
        presentDataCallback = createSpy('presentDataCallback');
        animationHandler = new AnimationHandler(particleUseCase);
        global.requestAnimationFrame = createSpy();
    });

    it('should initialize and start the simulation', function (): void {
        let counter: number = 0;

        (<Spy>global.requestAnimationFrame).and.callFake((callback: FrameRequestCallback) => {
            if (counter++ == 0) callback(0);
            return 0;
        });

        animationHandler.initialize(presentDataCallback);

        expect(global.requestAnimationFrame).toHaveBeenCalled();
        expect(presentDataCallback).toHaveBeenCalledTimes(2);
        expect(counter).toBe(2);
    });
});

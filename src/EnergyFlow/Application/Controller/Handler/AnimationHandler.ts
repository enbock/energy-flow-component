import {PresentDataCallback} from '../../../../ControllerHandler';
import ControllerHandler from '../../../../ControllerHandler';
import ParticleUseCase from '../../../Core/ParticleUseCase/ParticleUseCase';

export default class AnimationHandler implements ControllerHandler {
    private presentData!: PresentDataCallback;

    constructor(
        private particleUseCase: ParticleUseCase
    ) {
    }

    public initialize(presentData: PresentDataCallback): void {
        this.presentData = presentData;

        this.updateSimulation();
    }

    private updateSimulation(): void {
        this.particleUseCase.tick();
        this.presentData();
        requestAnimationFrame(this.updateSimulation.bind(this));
        // setTimeout(this.updateSimulation.bind(this), 500);
    }
}

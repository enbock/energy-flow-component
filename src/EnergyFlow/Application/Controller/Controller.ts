import EnergyFlow from '../View/EnergyFlow';
import EnergyFlowModel from '../View/EnergyFlowModel';
import ControllerHandler from '../../../ControllerHandler';
import ParticleUseCase from '../../Core/ParticleUseCase/ParticleUseCase';
import EnergyFlowPresenter from '../View/EnergyFlowPresenter';
import ResponseCollection from './ResponseCollection';
import ConnectionUseCase from '../../Core/ConnectionUseCase/ConnectionUseCase';

export default class Controller {
    constructor(
        private mainView: EnergyFlow,
        private handlers: Array<ControllerHandler>,
        private particleUseCase: ParticleUseCase,
        private connectionUseCase: ConnectionUseCase,
        private energyFlowPresenter: EnergyFlowPresenter
    ) {
    }

    public initialize(): void {
        this.mainView.render(new EnergyFlowModel());
        const presentDataCallback: Callback = this.presentData.bind(this);
        for (const handler of this.handlers) {
            handler.initialize(presentDataCallback);
        }
    }

    private presentData(): void {
        const data: ResponseCollection = new ResponseCollection();
        this.particleUseCase.getParticles(data.particleResponse);
        this.connectionUseCase.getConnections(data.connectionResponse);

        this.mainView.render(this.energyFlowPresenter.present(data));
    }
}

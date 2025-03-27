import EnergyFlow from '../View/EnergyFlow';
import EnergyFlowModel from '../View/EnergyFlowModel';
import ControllerHandler from '../../../ControllerHandler';

export default class Controller {
    constructor(
        private mainView: EnergyFlow,
        private handlers: Array<ControllerHandler>
    ) {

    }

    public async initialize(): Promise<void> {
        this.mainView.render(new EnergyFlowModel());
        for (const handler of this.handlers) {
            await handler.initialize();
        }
    }
}

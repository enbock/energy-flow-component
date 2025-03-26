import EnergyFlow from '../View/EnergyFlow';
import EnergyFlowModel from '../View/EnergyFlowModel';

export default class Controller {
    constructor(
        private mainView: EnergyFlow
    ) {

    }

    public init(): void {
        requestAnimationFrame(() => this.mainView.render(new EnergyFlowModel()));
    }
}

import Controller from '../Controller/Controller';
import EnergyFlow from '../View/EnergyFlow';

export default class Container {
    public controller: Controller;

    constructor(mainView: EnergyFlow) {
        this.controller = new Controller(mainView);
    }
}

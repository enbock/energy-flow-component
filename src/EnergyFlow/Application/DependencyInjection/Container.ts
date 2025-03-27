import Controller from '../Controller/Controller';
import EnergyFlow from '../View/EnergyFlow';
import Adapter from '../Adapter';
import ConnectionHandler from '../Controller/Handler/ConnectionHandler';
import Config from '../../Core/Config';
import ConnectionUseCase from '../../Core/ConnectionUseCase/ConnectionUseCase';
import StateStorageMemory from '../../Infrastructure/StateStorage/Memory';
import StateStorage from '../../Core/StateStorage';

export default class Container {
    public controller: Controller;
    public adapter: Adapter = new Adapter();
    public config: Config;

    constructor(mainView: EnergyFlow) {
        this.config = mainView.config;
        const stateStorage: StateStorage = new StateStorageMemory();
        const connectionUseCase: ConnectionUseCase = new ConnectionUseCase(
            stateStorage
        );
        this.controller = new Controller(
            mainView,
            [
                new ConnectionHandler(
                    this.adapter,
                    connectionUseCase
                )
            ]
        );
    }
}

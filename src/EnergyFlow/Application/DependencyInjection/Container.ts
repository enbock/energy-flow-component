import Controller from '../Controller/Controller';
import EnergyFlow from '../View/EnergyFlow';
import Adapter from '../Adapter';
import ConnectionHandler from '../Controller/Handler/ConnectionHandler';
import Config from '../../Core/Config';
import ConnectionUseCase from '../../Core/ConnectionUseCase/ConnectionUseCase';
import StateStorageMemory from '../../Infrastructure/StateStorage/Memory';
import StateStorage from '../../Core/StateStorage';
import AnimationHandler from '../Controller/Handler/AnimationHandler';
import ParticleUseCase from '../../Core/ParticleUseCase/ParticleUseCase';
import ParticleCreator from '../../Core/ParticleUseCase/Tasks/ParticleCreator';
import ParticleCleaner from '../../Core/ParticleUseCase/Tasks/ParticleCleaner';
import ParticleAnimator from '../../Core/ParticleUseCase/Tasks/ParticleAnimator';
import ConnectionFinder from '../../Core/ParticleUseCase/Tasks/ConnectionFinder';
import EnergyFlowPresenter from '../View/EnergyFlowPresenter';

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
        const connectionFinder: ConnectionFinder = new ConnectionFinder();
        const particleUseCase: ParticleUseCase = new ParticleUseCase(
            new ParticleCreator(
                this.config,
                connectionFinder
            ),
            new ParticleCleaner(),
            new ParticleAnimator(
                this.config
            ),
            stateStorage,
            connectionFinder
        );
        this.controller = new Controller(
            mainView,
            [
                new ConnectionHandler(
                    this.adapter,
                    connectionUseCase
                ),
                new AnimationHandler(
                    particleUseCase
                )
            ],
            particleUseCase,
            connectionUseCase,
            new EnergyFlowPresenter()
        );
    }
}

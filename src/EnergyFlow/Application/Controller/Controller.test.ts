import Controller from './Controller';
import ControllerHandler from '../../../ControllerHandler';
import {PresentDataCallback} from '../../../ControllerHandler';
import EnergyFlowModel from '../View/EnergyFlowModel';
import EnergyFlow from '../View/EnergyFlow';
import ParticleUseCase from '../../Core/ParticleUseCase/ParticleUseCase';
import ConnectionUseCase from '../../Core/ConnectionUseCase/ConnectionUseCase';
import EnergyFlowPresenter from '../View/EnergyFlowPresenter';
import GetParticlesResponse from './GetParticlesResponse';
import GetConnectionResponse from './GetConnectionResponse';
import ResponseCollection from './ResponseCollection';

describe('Controller', function (): void {
    let controller: Controller,
        mainView: Mocked<EnergyFlow>,
        handler: Mocked<ControllerHandler>,
        handlers: Array<Mocked<ControllerHandler>>,
        particleUseCase: Mocked<ParticleUseCase>,
        connectionUseCase: Mocked<ConnectionUseCase>,
        energyFlowPresenter: Mocked<EnergyFlowPresenter>;

    beforeEach(function (): void {
        mainView = mock<EnergyFlow>();
        handler = mock<ControllerHandler>();
        handlers = [handler];
        particleUseCase = mock<ParticleUseCase>();
        connectionUseCase = mock<ConnectionUseCase>();
        energyFlowPresenter = mock<EnergyFlowPresenter>();

        controller = new Controller(
            mainView,
            handlers,
            particleUseCase,
            connectionUseCase,
            energyFlowPresenter
        );
    });

    it('should render the main view and initialize handlers', async function (): Promise<void> {
        const energyFlowModel: EnergyFlowModel = new EnergyFlowModel();

        controller.initialize();

        expect(mainView.render).toHaveBeenCalledWith(energyFlowModel);
        expect(handler.initialize).toHaveBeenCalled();
    });

    it('should present data and render the main view', async function (): Promise<void> {
        const particles: MockedObject = 'test::particle';
        const connections: MockedObject = 'test::connection';

        particleUseCase.getParticles.and.callFake(function (response: GetParticlesResponse): void {
            response.particles = particles;
        });
        connectionUseCase.getConnections.and.callFake(function (response: GetConnectionResponse): void {
            response.connections = connections;
        });
        handler.initialize.and.callFake(function (presentDataCallback: PresentDataCallback): void {
            presentDataCallback();
        });
        energyFlowPresenter.present.and.returnValue(<MockedObject>'test::presentedData');

        controller.initialize();

        const expectedData: ResponseCollection = new ResponseCollection();
        expectedData.connectionResponse.connections = connections;
        expectedData.particleResponse.particles = particles;

        expect(particleUseCase.getParticles).toHaveBeenCalledWith(expectedData.particleResponse);
        expect(connectionUseCase.getConnections).toHaveBeenCalledWith(expectedData.connectionResponse);
        expect(energyFlowPresenter.present).toHaveBeenCalledWith(expectedData);
        expect(mainView.render).toHaveBeenCalledWith(<MockedObject>'test::presentedData');
    });
});

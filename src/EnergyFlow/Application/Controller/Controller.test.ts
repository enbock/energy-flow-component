import {describe, it, beforeEach} from 'node:test';
import * as assert from 'node:assert';
import {mock} from '../../../../test/mock';
import Controller from './Controller';
import ControllerHandler, {PresentDataCallback} from '../../../ControllerHandler';
import EnergyFlowModel from '../View/EnergyFlowModel';
import EnergyFlow from '../View/EnergyFlow';
import ParticleUseCase from '../../Core/ParticleUseCase/ParticleUseCase';
import ConnectionUseCase from '../../Core/ConnectionUseCase/ConnectionUseCase';
import EnergyFlowPresenter from '../View/EnergyFlowPresenter';
import GetParticlesResponse from './GetParticlesResponse';
import GetConnectionResponse from './GetConnectionResponse';
import ResponseCollection from './ResponseCollection';

describe('EnergyFlow.Application.Controller.Controller', function (): void {
    let controller: Controller;
    let mainView: Mocked<EnergyFlow>;
    let handler: Mocked<ControllerHandler>;
    let handlers: Array<Mocked<ControllerHandler>>;
    let particleUseCase: Mocked<ParticleUseCase>;
    let connectionUseCase: Mocked<ConnectionUseCase>;
    let energyFlowPresenter: Mocked<EnergyFlowPresenter>;

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

    it('should render the main view and initialize handlers', function (): void {
        const energyFlowModel: EnergyFlowModel = new EnergyFlowModel();

        controller.initialize();

        assert.deepStrictEqual(mainView.render.mock.calls[0].arguments, [energyFlowModel]);
        assert.strictEqual(handler.initialize.mock.calls.length, 1);
    });

    it('should present data and render the main view', function (): void {
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

        assert.deepStrictEqual(particleUseCase.getParticles.mock.calls[0].arguments, [expectedData.particleResponse]);
        assert.deepStrictEqual(
            connectionUseCase.getConnections.mock.calls[0].arguments,
            [expectedData.connectionResponse]
        );
        assert.deepStrictEqual(energyFlowPresenter.present.mock.calls[0].arguments, [expectedData]);
        assert.deepStrictEqual(mainView.render.mock.calls[1].arguments, [<MockedObject>'test::presentedData']);
    });
});

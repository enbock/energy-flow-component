import Controller from './Controller';
import ControllerHandler from '../../../ControllerHandler';
import EnergyFlowModel from '../View/EnergyFlowModel';
import EnergyFlow from '../View/EnergyFlow';

describe('Controller', function (): void {
    let controller: Controller,
        mainView: Mocked<EnergyFlow>,
        handler: Mocked<ControllerHandler>,
        handlers: Array<Mocked<ControllerHandler>>;

    beforeEach(function (): void {
        mainView = mock<EnergyFlow>();
        handler = mock<ControllerHandler>();
        handlers = [handler];

        controller = new Controller(
            mainView,
            handlers
        );
    });

    it('should render the main view and initialize handlers', async function (): Promise<void> {
        const energyFlowModel: EnergyFlowModel = new EnergyFlowModel();

        await controller.initialize();

        expect(mainView.render).toHaveBeenCalledWith(energyFlowModel);
        expect(handler.initialize).toHaveBeenCalled();
    });
});

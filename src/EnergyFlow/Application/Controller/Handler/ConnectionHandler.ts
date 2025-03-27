import ControllerHandler from '../../../../ControllerHandler';
import Adapter from '../../Adapter';
import ConnectionEntity from '../../../Core/ConnectionUseCase/ConnectionEntity';
import ConnectionUseCase from '../../../Core/ConnectionUseCase/ConnectionUseCase';

export default class ConnectionHandler implements ControllerHandler {
    constructor(
        private adapter: Adapter,
        private connectionUseCase: ConnectionUseCase
    ) {
    }

    public async initialize(): Promise<void> {
        this.adapter.updateConnections = this.changeConnections.bind(this);
    }

    private changeConnections(connections: Array<ConnectionEntity>): void {
        this.connectionUseCase.updateConnections({connections});
    }
}

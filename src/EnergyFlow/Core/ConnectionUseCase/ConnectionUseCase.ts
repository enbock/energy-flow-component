import StateStorage from '../StateStorage';
import UpdateConnectionsRequest from './UpdateConnectionsRequest';

export default class ConnectionUseCase {
    constructor(
        private stateStorage: StateStorage
    ) {
    }

    public updateConnections(request: UpdateConnectionsRequest): void {
        this.stateStorage.setConnections(request.connections);
    }
}

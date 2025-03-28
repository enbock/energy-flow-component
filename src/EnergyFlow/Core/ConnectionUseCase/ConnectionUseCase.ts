import StateStorage from '../StateStorage';
import UpdateConnectionsRequest from './UpdateConnectionsRequest';
import GetConnectionResponse from './GetConnectionResponse';

export default class ConnectionUseCase {
    constructor(
        private stateStorage: StateStorage
    ) {
    }

    public updateConnections(request: UpdateConnectionsRequest): void {
        this.stateStorage.setConnections(request.connections);
    }

    public getConnections(response: GetConnectionResponse): void {
        response.connections = this.stateStorage.getConnections();
    }
}

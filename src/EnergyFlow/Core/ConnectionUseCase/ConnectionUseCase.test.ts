import ConnectionUseCase from './ConnectionUseCase';
import StateStorage from '../StateStorage';
import UpdateConnectionsRequest from './UpdateConnectionsRequest';
import ConnectionEntity from './ConnectionEntity';
import GetConnectionResponse from './GetConnectionResponse';

describe('ConnectionUseCase', function (): void {
    let connectionUseCase: ConnectionUseCase,
        stateStorage: Mocked<StateStorage>;

    beforeEach(function (): void {
        stateStorage = mock<StateStorage>();

        connectionUseCase = new ConnectionUseCase(
            stateStorage
        );
    });

    it('should update connections in state storage', function (): void {
        const connections: Array<ConnectionEntity> = [<MockedObject>'connection1'];
        const request: UpdateConnectionsRequest = {
            connections: connections
        };

        connectionUseCase.updateConnections(request);

        expect(stateStorage.setConnections).toHaveBeenCalledWith(request.connections);
    });

    it('should get connections and set them in the response', function (): void {
        const connections: Array<ConnectionEntity> = <MockedObject>'test::connections';
        const response: GetConnectionResponse = {
            connections: <MockedObject>undefined
        };

        stateStorage.getConnections.and.returnValue(connections);

        connectionUseCase.getConnections(response);

        expect(stateStorage.getConnections).toHaveBeenCalled();
        expect(response.connections).toBe(connections);
    });
});

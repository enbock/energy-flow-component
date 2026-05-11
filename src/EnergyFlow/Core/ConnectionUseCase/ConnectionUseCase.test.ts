import {describe, it, beforeEach} from 'node:test';
import * as assert from 'node:assert';
import {mock} from '../../../../test/mock';
import ConnectionUseCase from './ConnectionUseCase';
import StateStorage from '../StateStorage';
import UpdateConnectionsRequest from './UpdateConnectionsRequest';
import ConnectionEntity from './ConnectionEntity';
import GetConnectionResponse from './GetConnectionResponse';

describe('EnergyFlow.Core.ConnectionUseCase.ConnectionUseCase', function (): void {
    let connectionUseCase: ConnectionUseCase;
    let stateStorage: Mocked<StateStorage>;

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

        assert.deepStrictEqual(stateStorage.setConnections.mock.calls[0].arguments, [request.connections]);
    });

    it('should get connections and set them in the response', function (): void {
        const connections: Array<ConnectionEntity> = <MockedObject>'test::connections';
        const response: GetConnectionResponse = {
            connections: <MockedObject>undefined
        };

        stateStorage.getConnections.and.returnValue(connections);

        connectionUseCase.getConnections(response);

        assert.strictEqual(stateStorage.getConnections.mock.calls.length, 1);
        assert.strictEqual(response.connections, connections);
    });
});

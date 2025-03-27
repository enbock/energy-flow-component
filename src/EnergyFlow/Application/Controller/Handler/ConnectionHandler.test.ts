import ConnectionHandler from './ConnectionHandler';
import ConnectionEntity from '../../../Core/ConnectionUseCase/ConnectionEntity';
import Adapter from '../../Adapter';
import ConnectionUseCase from '../../../Core/ConnectionUseCase/ConnectionUseCase';

describe('ConnectionHandler', function (): void {
    let handler: ConnectionHandler,
        adapter: Mocked<Adapter>,
        connectionUseCase: Mocked<ConnectionUseCase>;

    beforeEach(function (): void {
        adapter = mock<Adapter>();
        connectionUseCase = mock<ConnectionUseCase>();

        handler = new ConnectionHandler(
            adapter,
            connectionUseCase
        );
    });

    it('should update connections through connectionUseCase', async function (): Promise<void> {
        const connection1: ConnectionEntity = new ConnectionEntity();
        connection1.value = 1;
        const connection2: ConnectionEntity = new ConnectionEntity();
        connection2.value = 2;
        const connections: Array<ConnectionEntity> = [connection1, connection2];

        await handler.initialize();
        adapter.updateConnections(connections);

        expect(connectionUseCase.updateConnections).toHaveBeenCalledWith({connections});
    });
});

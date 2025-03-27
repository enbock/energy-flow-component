import ConnectionEntity from './ConnectionEntity';

export default interface UpdateConnectionsRequest {
    connections: Array<ConnectionEntity>;
}

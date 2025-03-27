import ConnectionEntity from '../Core/ConnectionUseCase/ConnectionEntity';

export default class Adapter {
    public updateConnections: Callback<(connections: Array<ConnectionEntity>) => void> = () => <never>false;
}

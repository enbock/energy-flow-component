import GetConnectionResponseInterface from '../../Core/ConnectionUseCase/GetConnectionResponse';
import ConnectionEntity from '../../Core/ConnectionUseCase/ConnectionEntity';

export default class GetConnectionResponse implements GetConnectionResponseInterface {
    public connections: Array<ConnectionEntity> = [];
}

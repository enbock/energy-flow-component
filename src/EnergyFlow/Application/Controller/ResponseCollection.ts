import GetParticlesResponse from './GetParticlesResponse';
import GetConnectionResponse from './GetConnectionResponse';

export default class ResponseCollection {
    public particleResponse: GetParticlesResponse = new GetParticlesResponse();
    public connectionResponse: GetConnectionResponse = new GetConnectionResponse();
}

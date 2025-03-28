import GetParticlesResponseInterface from '../../Core/ParticleUseCase/GetParticlesResponse';
import ParticleEntity from '../../Core/ParticleEntity';

export default class GetParticlesResponse implements GetParticlesResponseInterface {
    public particles: Array<ParticleEntity> = [];
}

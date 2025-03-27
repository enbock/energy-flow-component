import ConnectionEntity from './ConnectionUseCase/ConnectionEntity';
import ParticleEntity from './ParticleEntity';

export default interface StateStorage {
    getConnections(): Array<ConnectionEntity>;

    setConnections(connections: Array<ConnectionEntity>): void;

    getParticles(): Array<ParticleEntity>;

    setParticles(particles: Array<ParticleEntity>): void;
}

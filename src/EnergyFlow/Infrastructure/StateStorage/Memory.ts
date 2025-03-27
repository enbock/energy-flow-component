import StateStorage from '../../Core/StateStorage';
import ConnectionEntity from '../../Core/ConnectionUseCase/ConnectionEntity';
import ParticleEntity from '../../Core/ParticleEntity';

export default class Memory implements StateStorage {
    private connections: Array<ConnectionEntity> = [];
    private particles: Array<ParticleEntity> = [];

    public getConnections(): Array<ConnectionEntity> {
        return this.connections;
    }

    public setConnections(connections: Array<ConnectionEntity>): void {
        this.connections = connections;
    }

    public getParticles(): Array<ParticleEntity> {
        return this.particles;
    }

    public setParticles(particles: Array<ParticleEntity>): void {
        this.particles = particles;
    }
}

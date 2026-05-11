import EnergyFlowModel from './EnergyFlowModel';
import {ParticleModel} from './EnergyFlowModel';
import ParticleEntity from '../../Core/ParticleEntity';
import ResponseCollection from '../Controller/ResponseCollection';

export default class EnergyFlowPresenter {
    public present(data: ResponseCollection): EnergyFlowModel {
        const model: EnergyFlowModel = new EnergyFlowModel();

        model.particles = data.particleResponse.particles.map(
            (p: ParticleEntity): ParticleModel => this.presentParticle(p)
        );
        model.colors = data.connectionResponse.connections.map(c => c.color);

        return model;
    }

    private presentParticle(particle: ParticleEntity): ParticleModel {
        const model: ParticleModel = new ParticleModel();

        model.connectionIndex = particle.source ?? 0;
        model.x = particle.position.x;
        model.y = particle.position.y;
        model.trajectory = particle.trajectory.map(function (p: {x: number, y: number}): {x: number, y: number} {
            return {x: p.x, y: p.y};
        });

        return model;
    }
}

import Container from '../DependencyInjection/Container';
import Style from './Style.css';
import EnergyFlowModel from './EnergyFlowModel';
import {ParticleModel} from './EnergyFlowModel';

/**
 * TODO: Parsing of connections and position via top/left by canvas size.
 */

class Config {
    public particleSize: number = 1;
    public canvasWidth: number = 0;
    public canvasHeight: number = 0;
}

export default class EnergyFlow extends HTMLElement {
    private model: EnergyFlowModel = new EnergyFlowModel();
    private config: Config = new Config();
    private readonly resizeCallback: Callback;

    constructor(
        private readonly canvas: HTMLCanvasElement = document.createElement('canvas'),
        private readonly container: Container
    ) {
        super();

        this.resizeCallback = () => this.renderView();

        const shadow: ShadowRoot = this.attachShadow({mode: 'open'});
        shadow.innerHTML = `<style>${Style}</style><slot/>`;
        shadow.appendChild(this.canvas);

        this.container = new Container(this);
        this.container.controller.init();
    }

    // noinspection JSUnusedGlobalSymbols
    public connectedCallback(): void {
        window.addEventListener('resize', this.resizeCallback);
    }

    // noinspection JSUnusedGlobalSymbols
    public disconnectedCallback(): void {
        window.removeEventListener('resize', this.resizeCallback);
    }

    public render(model: EnergyFlowModel): void {
        this.model = model;
        this.model.particles.sort((a, b) => a.connectionIndex - b.connectionIndex);
        requestAnimationFrame(() => this.renderView());
    }

    private renderView(): void {
        this.resizeCanvas();

        const context: CanvasRenderingContext2D | null = this.canvas.getContext('2d');
        if (!context) return;

        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        context.save();
        let lastColorIndex: number = -1;

        for (const particle of this.model.particles) {
            if (particle.connectionIndex != lastColorIndex) {
                context.restore();
                context.save();
                context.fillStyle = this.model.colors[particle.connectionIndex];
            }
            lastColorIndex = particle.connectionIndex;

            this.renderParticle(particle, context);
        }

        context.restore();
    }

    private resizeCanvas() {
        const dim: DOMRect = this.getBoundingClientRect();
        this.config.canvasWidth = Math.round(dim.width);
        this.config.canvasHeight = Math.round(dim.height);
        this.canvas.width = this.config.canvasWidth;
        this.canvas.height = this.config.canvasHeight;
    }

    private renderParticle(particle: ParticleModel, context: CanvasRenderingContext2D): void {
        const radius: number = Math.sqrt(this.canvas.width * this.canvas.height) * (this.config.particleSize / 150);
        context.beginPath();
        const halfWidth: number = this.config.canvasWidth * 0.5;
        const halfHeight: number = this.config.canvasHeight * 0.5;
        context.arc(
            halfWidth * particle.x + halfWidth,
            halfHeight * particle.y + halfHeight,
            radius,
            0,
            Math.PI * 2
        );
        context.fill();
    }
}

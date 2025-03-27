import Container from '../DependencyInjection/Container';
import Style from './Style.css';
import EnergyFlowModel from './EnergyFlowModel';
import {ParticleModel} from './EnergyFlowModel';
import ConnectionEntity from '../../Core/ConnectionUseCase/ConnectionEntity';
import Config from '../../Core/Config';

export default class EnergyFlow extends HTMLElement {
    public config: Config = new Config();
    private model: EnergyFlowModel = new EnergyFlowModel();
    private readonly resizeCallback: Callback;
    private parseTimer: number = 0;

    constructor(
        private readonly canvas: HTMLCanvasElement = document.createElement('canvas'),
        private readonly container: Container
    ) {
        super();

        this.resizeCallback = () => this.updateComponent();

        const shadow: ShadowRoot = this.attachShadow({mode: 'open'});
        shadow.innerHTML = `<style>${Style}</style><slot/>`;
        shadow.appendChild(this.canvas);

        this.container = new Container(this);
        void this.container.controller.initialize();
    }

    // noinspection JSUnusedGlobalSymbols
    public connectedCallback(): void {
        window.addEventListener('resize', this.resizeCallback);
        this.parseTimer = <any>setInterval(() => this.updateChildren(), this.config.updateTimeout);
        requestAnimationFrame(() => this.updateComponent());
    }

    // noinspection JSUnusedGlobalSymbols
    public disconnectedCallback(): void {
        window.removeEventListener('resize', this.resizeCallback);
        clearInterval(this.parseTimer);
    }

    public render(model: EnergyFlowModel): void {
        this.model = model;
        this.model.particles.sort((a, b) => a.connectionIndex - b.connectionIndex);
        requestAnimationFrame(() => this.renderView());
    }

    private updateComponent(): void {
        this.renderView();
        this.updateChildren();
    }

    private updateChildren(): void {
        const connectionElements: NodeListOf<HTMLHtmlElement> = this.querySelectorAll('energy-connection');
        const connections: Array<ConnectionEntity> = [];

        connectionElements.forEach((node) => {
            const connection: ConnectionEntity = new ConnectionEntity();
            connection.value = parseFloat(node.getAttribute('value') || '0');
            connection.x = parseFloat(node.getAttribute('x') || '0');
            connection.y = parseFloat(node.getAttribute('y') || '0');
            connection.color = node.getAttribute('color') || 'rgba(255,0,255,1)';

            connections.push(connection);

            const position: { x: number, y: number } = this.calculatePosition(connection.x, connection.y);
            node.style.left = Math.round(position.x) + 'px';
            node.style.top = Math.round(position.y) + 'px';
        });

        this.container.adapter.updateConnections(connections);
    }

    private renderView(): void {
        this.resizeCanvas();

        const context: CanvasRenderingContext2D | null = this.canvas.getContext('2d');
        if (!context) return;

        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        context.save();
        let lastColorIndex: number = -1;
        const radius: number = Math.sqrt(
            this.config.canvasWidth * this.config.canvasHeight) * (this.config.particleSize / 150);

        for (const particle of this.model.particles) {
            if (particle.connectionIndex != lastColorIndex) {
                context.restore();
                context.save();
                context.fillStyle = this.model.colors[particle.connectionIndex];
            }
            lastColorIndex = particle.connectionIndex;

            this.renderParticle(particle, context, radius);
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

    private renderParticle(particle: ParticleModel, context: CanvasRenderingContext2D, radius: number): void {
        context.beginPath();
        const position: { x: number, y: number } = this.calculatePosition(particle.x, particle.y);
        context.arc(
            position.x,
            position.y,
            radius,
            0,
            Math.PI * 2
        );
        context.fill();
    }

    private calculatePosition(x: number, y: number): { x: number, y: number } {
        const halfWidth: number = this.config.canvasWidth * 0.5;
        const halfHeight: number = this.config.canvasHeight * 0.5;

        return {
            x: halfWidth * x + halfWidth,
            y: halfHeight * y + halfHeight
        };
    }
}

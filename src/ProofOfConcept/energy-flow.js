"use strict";
class EnergyFlow extends HTMLElement {
    canvas;
    connections = [];
    particles = [];
    animationId = null;
    numParticles = 5000;
    particleSize = 1;
    particleSpeed = 1;
    targetSize = 1;
    updateTimer = 0;
    constructor() {
        super();
        // Shadow Root anlegen (optional, um Kapselung zu erreichen)
        const shadow = this.attachShadow({ mode: 'open' });
        // Canvas erstellen und anhängen
        this.canvas = document.createElement('canvas');
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        shadow.appendChild(this.canvas);
    }
    connectedCallback() {
        // Canvas-Größe anpassen (z.B. an die tatsächliche Größe des Elements)
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas.bind(this));
        // Kindelemente <energy-connection> auslesen und Daten speichern
        this.parseConnections();
        this.initParticles();
        // Animation starten
        this.startAnimation();
        this.updateTimer = setInterval(() => this.parseConnections(), 1000);
    }
    disconnectedCallback() {
        clearInterval(this.updateTimer);
        // Event-Listener und Animation aufräumen
        window.removeEventListener('resize', this.resizeCanvas.bind(this));
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    // Liest die <energy-connection>-Elemente aus dem Light DOM (oder Shadow DOM) des Elements
    parseConnections() {
        // Alle <energy-connection>-Kindelemente holen
        const connectionElements = this.querySelectorAll('energy-connection');
        this.connections = [];
        connectionElements.forEach((elem) => {
            const valueAttr = parseFloat(elem.getAttribute('value') || '0');
            const xAttr = parseFloat(elem.getAttribute('x') || '0');
            const yAttr = parseFloat(elem.getAttribute('y') || '0');
            this.connections.push({
                value: valueAttr,
                x: this.canvas.width * xAttr / 2,
                y: this.canvas.height * yAttr / 2
            });
        });
    }
    // Erzeugt die Anfangszustände der Teilchen
    initParticles() {
        this.particles = [];
        // Alle Teilchen erzeugen
        for (let i = 0; i < this.numParticles; i++)
            setTimeout(() => {
                this.particles.push({
                    x: this.canvas.width / 2,
                    y: this.canvas.height / 2,
                    vx: 0,
                    vy: 0,
                    progress: 0,
                    progressBefore: 1
                });
            }, i * (this.particleSpeed / 3) * Math.random());
    }
    // Wählt eine Connection aus, entweder positiv oder negativ, gewichtet nach ihrem Absolutwert
    chooseConnectionIndex(positive) {
        const filtered = this.connections
            .map((conn, idx) => ({ conn, idx }))
            .filter(obj => positive ? obj.conn.value > 0 : obj.conn.value < 0);
        if (filtered.length === 0) {
            // Keine passenden Verbindungen -> undefined
            return undefined;
        }
        // Gesamtwert bilden (Summe der Beträge)
        const sum = filtered.reduce((acc, obj) => acc + Math.abs(obj.conn.value), 0);
        // Zufallszahl ziehen, dann Connection auswählen
        let rand = Math.random() * sum;
        for (const obj of filtered) {
            const amount = Math.abs(obj.conn.value);
            if (rand <= amount) {
                return obj.idx;
            }
            rand -= amount;
        }
        return filtered[filtered.length - 1].idx; // Fallback
    }
    // Haupt-Animationsloop
    animateLoop() {
        // Context holen
        const ctx = this.canvas.getContext('2d');
        if (!ctx)
            return;
        // Canvas leeren
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Alle Verbindungen zeichnen (z.B. als Kreise)
        // this.drawConnections();
        // Alle Teilchen updaten und zeichnen
        this.updateParticles();
        this.drawParticles();
        // Nächsten Frame anfordern
        this.animationId = requestAnimationFrame(() => this.animateLoop());
    }
    startAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.animateLoop();
    }
    updateParticles() {
        const speed = (this.particleSpeed / 3500) * Math.sqrt(this.canvas.width * this.canvas.height);
        const jitterAmp = speed * 1.5;
        this.particles.forEach((p) => {
            let isArrived;
            let targetConn = (p.target !== undefined) ? this.connections[p.target] : undefined;
            const sourceConn = (p.source !== undefined) ? this.connections[p.source] : undefined;
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            // Regulärer Fall: Teilchen hat eine source (positiv) und ein target (negativ)
            // Wenn es kein aktives Ziel gibt (z.B. weil keine negative Connection existiert),
            // oder die Ziel-Connection ist 0, wähle ein neues
            if (!targetConn || targetConn.value >= 0) {
                p.target = this.chooseConnectionIndex(false);
            }
            // Bestimme die aktuelle Position des Partikels
            const px = p.x;
            const py = p.y;
            // Vektor vom Partikel zur Mitte
            let dxCenter = centerX - px;
            let dyCenter = centerY - py;
            let distCenter = Math.hypot(centerX, centerY);
            // Normiere diesen Vektor, falls er nicht Null ist
            if (distCenter !== 0) {
                dxCenter /= distCenter;
                dyCenter /= distCenter;
            }
            // Hole die Ziel-Connection und bestimme den Zielpunkt
            if (p.target !== undefined) {
                let ax = dxCenter;
                let ay = dyCenter;
                // Normiere auch den neuen Richtungsvektor (optional, um eine konstante Magnitude zu haben)
                const aMag = Math.hypot(ax, ay);
                if (aMag !== 0) {
                    ax /= aMag;
                    ay /= aMag;
                }
                const tConn = this.connections[p.target];
                const tx = this.canvas.width / 2 + tConn.x;
                const ty = this.canvas.height / 2 + tConn.y;
                const dx = tx - p.x;
                const dy = ty - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (sourceConn && p.progress < 1) {
                    const distSourceCenter = this.calculateDistance(this.canvas.width / 2 + sourceConn.x, this.canvas.height / 2 + sourceConn.y, this.canvas.width / 2, this.canvas.height / 2);
                    const dist = this.calculateDistance(p.x, p.y, this.canvas.width / 2, this.canvas.height / 2);
                    p.progressBefore = p.progress;
                    p.progress = 1 - (1 / distSourceCenter * dist);
                    if (p.progress < p.progressBefore)
                        p.progress = 1;
                }
                const centerMod = 1 - p.progress;
                const posMod = p.progress;
                // Geschwindigkeit anpassen: Hier kannst du eine Konstante einbringen,
                // die bestimmt, wie schnell sich das Partikel bewegen soll.
                p.vx += (speed * dx / dist) * posMod + (ax * speed) * centerMod;
                p.vy += (speed * dy / dist) * posMod + (ay * speed) * centerMod;
                // Optionale kleine zufällige Abweichung, damit es ein “Tanzen” gibt:
                p.vx += (Math.random() - 0.5) * jitterAmp;
                p.vy += (Math.random() - 0.5) * jitterAmp;
            }
            // Update der Position
            p.x += p.vx;
            p.y += p.vy;
            // (Evtl. Dämpfung, um Überschwinger zu mindern)
            p.vx *= 0.95;
            p.vy *= 0.95;
            // Prüfung, ob das Teilchen sein Ziel erreicht hat (Radius z.B. 5 Pixel)
            const isInTargetZone = p.target !== undefined && targetConn &&
                Math.hypot((this.canvas.width / 2 + targetConn.x) - p.x, (this.canvas.height / 2 + targetConn.y) - p.y) < Math.sqrt(this.canvas.width * this.canvas.height) * (this.particleSize / 150) * this.targetSize * 4;
            isArrived = Boolean(isInTargetZone && targetConn.value < 0);
            if (!targetConn || !sourceConn || isArrived) {
                // An einer negativen Connection angekommen -> neu starten bei einer positiven Connection
                p.source = this.chooseConnectionIndex(true);
                if (p.source !== undefined) {
                    const sConn = this.connections[p.source];
                    p.x = this.canvas.width / 2 + sConn.x;
                    p.y = this.canvas.height / 2 + sConn.y;
                }
                // Neues Ziel suchen
                p.target = this.chooseConnectionIndex(false);
                p.vx = 0;
                p.vy = 0;
                p.progress = 0;
                p.progressBefore = 1;
            }
        });
    }
    calculateDistance(x1, y1, x2, y2) {
        const deltaX = x2 - x1;
        const deltaY = y2 - y1;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }
    drawParticles() {
        // Context holen
        const ctx = this.canvas.getContext('2d');
        if (!ctx)
            return;
        const radius = Math.sqrt(this.canvas.width * this.canvas.height) * (this.particleSize / 150);
        ctx.save();
        this.particles.forEach((p) => {
            // Zeichne den Kreis mit dem Farbverlauf
            ctx.fillStyle = 'rgba(0,0,255,0.25)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }
    resizeCanvas() {
        // Größe des eigenen Elements auslesen
        const rect = this.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
}
// Definition des Custom Elements
customElements.define('energy-flow', EnergyFlow);
